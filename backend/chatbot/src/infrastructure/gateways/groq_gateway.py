import asyncio
from groq import AsyncClient, RateLimitError as GroqRateLimitError, APITimeoutError as GroqAPITimeoutError

from src.application.ports.ai_gateway_port import AIGatewayPort, AIGatewayError
from src.domain.errors.chatbot_errors import (
    GroqUnavailableError,
    GroqRateLimitError as DomainGroqRateLimitError,
    GroqTimeoutError,
    ContextTooLargeError,
)
from config.settings import settings
from src.infrastructure.logging.logger import get_logger

log = get_logger("nexus.groq_gateway")


class GroqAIGateway(AIGatewayPort):
    """Adaptador de IA para Groq con manejo robusto de errores y reintentos.

    Usa Groq para generar respuestas basadas en el conocimiento disponible.
    Implementa reintentos automáticos con backoff exponencial para errores transitorios.
    """

    def __init__(self, api_key: str, api_url: str = "https://api.groq.com", model: str = "meta-llama/llama-4-scout-17b-16e-instruct"):
        self._api_key = api_key
        self._api_url = api_url.rstrip("/")
        if self._api_url.endswith("/openai/v1"):
            self._api_url = self._api_url[: -len("/openai/v1")]
        self._model = model
        self._timeout = settings.groq_timeout_seconds
        self._max_retries = settings.groq_max_retries

    async def generate_response(
        self,
        system_prompt: str,
        history: list[dict],
        user_message: str,
    ) -> str:
        """Genera respuesta desde Groq con reintentos y manejo de errores específicos.
        
        Args:
            system_prompt: Prompt del sistema con contexto
            history: Historial de conversación previo
            user_message: Mensaje actual del usuario
            
        Returns:
            Respuesta generada por Groq
            
        Raises:
            GroqUnavailableError: Si Groq no responde (error 5xx, conexión rechazada)
            DomainGroqRateLimitError: Si Groq devuelve 429 (NO se reintenta)
            GroqTimeoutError: Si la solicitud supera el timeout
            ContextTooLargeError: Si el contexto supera el límite de tokens
            AIGatewayError: Para otros errores inesperados
        """
        if not self._api_key:
            raise AIGatewayError("API key de Groq no configurada")

        messages = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": user_message},
        ]

        retry_count = 0
        last_error = None
        
        while retry_count <= self._max_retries:
            try:
                response = await self._call_groq_with_timeout(messages)
                
                # Validar respuesta
                if not getattr(response, "choices", None):
                    raise AIGatewayError("El gateway de IA no devolvió una respuesta válida")

                first_choice = response.choices[0]
                message = getattr(first_choice, "message", None)
                content = getattr(message, "content", None) if message is not None else None

                if not content:
                    raise AIGatewayError("El gateway de IA devolvió una respuesta vacía")

                log.debug(f"Respuesta generada exitosamente en intento {retry_count + 1}")
                return content.strip()

            except asyncio.TimeoutError:
                error_msg = f"Request timeout después de {self._timeout}s"
                last_error = GroqTimeoutError(error_msg)
                log.warning(f"Timeout en Groq (intento {retry_count + 1}/{self._max_retries + 1}): {error_msg}")
                
                if retry_count < self._max_retries:
                    backoff = 2 ** retry_count
                    log.info(f"Reintentando en {backoff}s...")
                    await asyncio.sleep(backoff)
                    retry_count += 1
                else:
                    raise last_error

            except GroqRateLimitError as exc:
                # NO reintentar en rate limit
                error_msg = f"Rate limited by Groq (429): {exc}"
                log.error(f"Rate limit en Groq: {error_msg}")
                raise DomainGroqRateLimitError(error_msg) from exc

            except Exception as exc:
                exc_str = str(exc).lower()
                
                # Detectar context_length_exceeded
                if "context_length_exceeded" in exc_str or "context_length" in exc_str:
                    error_msg = f"Contexto supera límite de tokens de Groq: {exc}"
                    log.error(error_msg)
                    raise ContextTooLargeError(error_msg) from exc
                
                # Errors 5xx o conexión rechazada
                error_msg = f"Groq unavailable: {exc}"
                last_error = GroqUnavailableError(error_msg)
                log.warning(f"Error transitorios en Groq (intento {retry_count + 1}/{self._max_retries + 1}): {error_msg}")
                
                if retry_count < self._max_retries:
                    backoff = 2 ** retry_count
                    log.info(f"Reintentando en {backoff}s...")
                    await asyncio.sleep(backoff)
                    retry_count += 1
                else:
                    raise last_error
        
        # Si llegamos aquí, se agotaron los reintentos
        raise last_error

    async def _call_groq_with_timeout(self, messages: list[dict]) -> object:
        """Ejecuta llamada a Groq con timeout configurado.
        
        Args:
            messages: Lista de mensajes para la API
            
        Returns:
            Respuesta de Groq
            
        Raises:
            asyncio.TimeoutError: Si se supera el timeout
            Otras excepciones de Groq
        """
        async with AsyncClient(api_key=self._api_key, base_url=self._api_url) as client:
            return await asyncio.wait_for(
                client.chat.completions.create(
                    messages=messages,
                    model=self._model,
                    temperature=0.7,
                    max_tokens=512,
                    user="nexus-bot",
                ),
                timeout=self._timeout,
            )
