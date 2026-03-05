"""
APLICACIÓN — Caso de Uso: SendMessage
Orquesta dominio + repositorios + gateway de IA mediante contratos.
NO importa implementaciones concretas (mysql2, groq, etc).
"""
import json
from dataclasses import dataclass

from src.domain.entities.chat_message import ChatSession
from src.domain.repositories.contracts import (
    HeroRepositoryPort,
    ItemRepositoryPort,
    ChatSessionRepositoryPort,
)
from src.domain.services.chatbot_service import ChatbotDomainService
from src.application.ports.ai_gateway_port import AIGatewayPort, AIGatewayError


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
        hero_repo: HeroRepositoryPort,
        item_repo: ItemRepositoryPort,
        session_repo: ChatSessionRepositoryPort,
        ai_gateway: AIGatewayPort,
        domain_service: ChatbotDomainService,
    ):
        self._heroes = hero_repo
        self._items = item_repo
        self._sessions = session_repo
        self._ai = ai_gateway
        self._domain = domain_service

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
            knowledge=json.dumps(knowledge, ensure_ascii=False, indent=2)
        )

        # 7. Agregar mensaje del usuario al historial
        session.add_message("user", input_data.message)

        # 8. Llamar al gateway de IA (nunca directamente al LLM)
        try:
            bot_reply = await self._ai.generate_response(
                system_prompt=system_prompt,
                history=session.get_history_for_llm()[:-1],  # sin el último mensaje
                user_message=input_data.message,
            )
        except AIGatewayError as e:
            return SendMessageOutput(
                user_id=input_data.user_id,
                response="⚠️ El oráculo no responde en este momento. Intenta de nuevo en breve.",
                intent="service_unavailable",
                suggestions=self._domain.get_suggestions("help"),
            )

        # 9. Guardar respuesta en sesión y persistir
        session.add_message("assistant", bot_reply)
        self._sessions.save(session)

        # 10. Retornar resultado
        return SendMessageOutput(
            user_id=input_data.user_id,
            response=bot_reply,
            intent=intent,
            suggestions=self._domain.get_suggestions(intent),
        )

    def _build_knowledge_context(self, intent: str, message: str) -> dict:
        """
        Construye el contexto de conocimiento según la intención.
        Solo carga los datos relevantes para no sobrecargar el prompt.
        """
        context = {}
        message_lower = message.lower()

        # Contexto de héroes
        if intent in ("hero_query", "hero_stats", "rarity_query", "item_compat", "how_to_play"):
            heroes = self._heroes.find_all()
            context["heroes"] = [h.to_summary() for h in heroes]

            # Si pregunta por un héroe específico, incluir detalle completo
            for hero in heroes:
                if hero.name.lower() in message_lower or hero.hero_type.lower() in message_lower:
                    context["hero_detail"] = {
                        "name": hero.name,
                        "type": hero.hero_type,
                        "rarity": hero.rarity,
                        "stats": {
                            "hp": hero.stats.hp,
                            "attack": hero.stats.attack,
                            "defense": hero.stats.defense,
                            "speed": hero.stats.speed,
                            "mana": hero.stats.mana,
                        },
                        "abilities": hero.abilities,
                        "special_power": hero.special_power,
                        "lore": hero.lore,
                    }
                    break

        # Contexto de ítems
        if intent in ("item_query", "item_compat", "item_price", "rarity_query"):
            items = self._items.find_all()
            context["items"] = [i.to_summary() for i in items]

            # Si pregunta por ítem específico, incluir detalle
            for item in items:
                if item.name.lower() in message_lower or item.item_type.lower() in message_lower:
                    context["item_detail"] = {
                        "name": item.name,
                        "type": item.item_type,
                        "rarity": item.rarity,
                        "stats": {
                            "attack_bonus": item.stats.attack_bonus,
                            "defense_bonus": item.stats.defense_bonus,
                            "speed_bonus": item.stats.speed_bonus,
                            "hp_bonus": item.stats.hp_bonus,
                            "mana_bonus": item.stats.mana_bonus,
                        },
                        "compatible_heroes": item.compatible_heroes,
                        "description": item.description,
                        "price": item.price,
                    }
                    break

        return context
