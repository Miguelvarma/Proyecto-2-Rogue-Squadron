"""
APLICACIÓN — Caso de Uso: SendMessage
Orquesta dominio + repositorios + gateway de IA mediante contratos.
NO importa implementaciones concretas (mysql2, groq, etc).
"""
import json
from dataclasses import dataclass

from src.domain.entities.chat_message import ChatSession
from src.domain.repositories.contracts import (
    ChatSessionRepositoryPort,
)
from src.domain.services.chatbot_service import ChatbotDomainService
from src.domain.services.ConversationWindowService import ConversationWindowService
from src.application.ports.ai_gateway_port import AIGatewayPort, AIGatewayError
from src.domain.repositories.IKnowledgeBaseRepository import IKnowledgeBaseRepository
from src.domain.services.ContextSelectorService import ContextSelectorService
from src.domain.errors.chatbot_errors import (
    GroqUnavailableError,
    GroqRateLimitError,
    GroqTimeoutError,
    ContextTooLargeError,
)
from src.infrastructure.logging.logger import get_logger, log_context_selection


@dataclass
class SendMessageInput:
    user_id: str
    message: str


@dataclass
class SendMessageOutput:
    user_id: str
    response: str
    intent: str
    suggestions: list[str]


SYSTEM_PROMPT_TEMPLATE = """Eres NexusBot, el asistente oficial de THE NEXUS BATTLES V.
Tu misión es ayudar a los jugadores con información precisa sobre héroes e ítems del juego.

REGLAS:
- Responde siempre en el mismo idioma del usuario (español o inglés).
- Sé conciso, claro y usa el tono épico del juego.
- Si no tienes información, dilo honestamente.
- Solo responde preguntas relacionadas con el juego.
- No inventes estadísticas ni datos que no estén en la base de conocimiento.

BASE DE CONOCIMIENTO DEL JUEGO:
{knowledge}
"""


class SendMessageUseCase:
    """
    Caso de uso principal del chatbot.
    Solo usa contratos (puertos), nunca implementaciones directas.
    """

    def __init__(
        self,
        session_repo: ChatSessionRepositoryPort,
        ai_gateway: AIGatewayPort,
        domain_service: ChatbotDomainService,
        context_selector: ContextSelectorService,
        knowledge_base_repo: IKnowledgeBaseRepository,
    ):
        self._sessions = session_repo
        self._ai = ai_gateway
        self._domain = domain_service
        self._context_selector = context_selector
        self._knowledge_base_repo = knowledge_base_repo
        self._logger = get_logger("nexus.chatbot.context")
        self._error_logger = get_logger("nexus.chatbot.errors")

    async def execute(self, input_data: SendMessageInput) -> SendMessageOutput:
        # 1. Validar mensaje
        if not self._domain.validate_message_length(input_data.message):
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="Tu mensaje debe tener entre 1 y 500 caracteres.",
                intent="validation_error",
                suggestions=self._domain.get_suggestions("help"),
            )

        # 2. Filtro de contenido inapropiado
        if self._domain.is_inappropriate(input_data.message):
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="⚔️ ¡Guerrero! Mantén el honor en esta sala. Estoy aquí para ayudarte con Nexus Battles V. 😊",
                intent="filtered",
                suggestions=self._domain.get_suggestions("greeting"),
            )

        # 3. Detectar intención
        intent = self._domain.detect_intent(input_data.message)

        # 4. Obtener o crear sesión
        session = self._sessions.find_by_user_id(input_data.user_id)
        if session is None:
            session = ChatSession(user_id=input_data.user_id)

        # 5. Construir contexto de conocimiento relevante
        knowledge = self._build_knowledge_context(intent, input_data.message)

        # 6. Construir system prompt con conocimiento
        system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
            knowledge=json.dumps(
                knowledge,
                ensure_ascii=False,
                separators=(",", ":"),
            )
        )

        # 7. Agregar mensaje del usuario al historial (sesión completa)
        session.add_message("user", input_data.message)

        # 8. Aplicar ventana deslizante al historial ANTES de enviarlo a Groq
        full_history = session.get_history_for_llm()[:-1]  # sin el último mensaje
        windowed = ConversationWindowService.apply_window(
            full_history=full_history,
            system_prompt=system_prompt,
            user_message=input_data.message,
        )
        ConversationWindowService.log_truncation(windowed, input_data.message)

        # 9. Llamar al gateway de IA con historial truncado (pero session completa se persiste)
        try:
            bot_reply = await self._ai.generate_response(
                system_prompt=system_prompt,
                history=windowed.messages,  # ← Usar historial truncado
                user_message=input_data.message,
            )

        except GroqRateLimitError as e:
            self._error_logger.warning(
                f"Rate limit en Groq | Usuario: {input_data.user_id} | "
                f"Pregunta: {input_data.message[:100]}"
            )
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="⏳ Demasiadas consultas seguidas. Espera un momento antes de continuar.",
                intent="rate_limit",
                suggestions=self._domain.get_suggestions("help"),
            )

        except GroqTimeoutError as e:
            self._error_logger.warning(
                f"Timeout en Groq | Usuario: {input_data.user_id} | "
                f"Pregunta: {input_data.message[:100]}"
            )
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="⏱️ La consulta tardó demasiado. Intenta con una pregunta más corta.",
                intent="timeout",
                suggestions=self._domain.get_suggestions("help"),
            )

        except ContextTooLargeError as e:
            self._error_logger.error(
                f"Contexto demasiado grande | Usuario: {input_data.user_id} | "
                f"Tokens estimados: {windowed.tokens_before} | "
                f"Pregunta: {input_data.message[:100]}"
            )
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="📚 La conversación es muy larga. Considera iniciar un nuevo chat.",
                intent="context_too_large",
                suggestions=self._domain.get_suggestions("help"),
            )

        except GroqUnavailableError as e:
            self._error_logger.error(
                f"Groq no disponible | Usuario: {input_data.user_id} | "
                f"Error: {str(e)[:200]}"
            )
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="⚠️ El asistente no está disponible en este momento. Intenta en unos segundos.",
                intent="service_unavailable",
                suggestions=self._domain.get_suggestions("help"),
            )

        except AIGatewayError as e:
            self._error_logger.error(
                f"Error inesperado del gateway | Usuario: {input_data.user_id} | "
                f"Error: {str(e)[:200]}",
                exc_info=True,
            )
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="❌ Ocurrió un error inesperado. Intenta nuevamente.",
                intent="internal_error",
                suggestions=self._domain.get_suggestions("help"),
            )

        except Exception as e:
            self._error_logger.error(
                f"Error no controlado en send_message | Usuario: {input_data.user_id} | "
                f"Error: {str(e)[:200]}",
                exc_info=True,
            )
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="❌ Ocurrió un error inesperado. Intenta nuevamente.",
                intent="internal_error",
                suggestions=self._domain.get_suggestions("help"),
            )

        # 10. Guardar respuesta en sesión (historial COMPLETO se persiste, no el truncado)
        session.add_message("assistant", bot_reply)
        self._sessions.save(session)

        # 11. Retornar resultado
        return SendMessageOutput(
            user_id=input_data.user_id,
            response=bot_reply,
            intent=intent,
            suggestions=self._domain.get_suggestions(intent),
        )

    def _build_knowledge_context(self, intent: str, message: str) -> dict:
        """
        Construye el contexto de conocimiento según la intención.
        Carga solo el conocimiento relevante de la base y agrega detalles específicos.
        """
        context: dict = {}
        selected_categories, used_fallback = self._context_selector.select_categories(message)
        knowledge_by_category: dict[str, list[dict]] = {}

        for category in selected_categories:
            try:
                rows = self._knowledge_base_repo.get_by_categoria(category)
            except Exception:
                rows = []
            if rows:
                knowledge_by_category[category] = rows

        context["knowledge_base"] = {
            "selected_categories": selected_categories,
            "used_fallback": used_fallback,
            "data": knowledge_by_category,
        }

        context_payload = json.dumps(context["knowledge_base"], ensure_ascii=False, separators=(",", ":"))
        log_context_selection(
            logger=self._logger,
            question=message,
            selected_categories=selected_categories,
            used_fallback=used_fallback,
            context_payload=context_payload,
        )

        return context
