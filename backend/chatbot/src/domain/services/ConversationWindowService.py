"""
DOMINIO — Servicio de Ventana Deslizante
Trunca historial de forma inteligente manteniendo el context token limit.
Mantiene siempre: mensaje de sistema + últimos N mensajes + mensaje actual del usuario.
"""
from dataclasses import dataclass
from config.settings import settings
from src.infrastructure.logging.logger import get_logger

log = get_logger("nexus.conversation_window")


@dataclass
class WindowedHistory:
    """Resultado de aplicar la ventana deslizante al historial"""
    messages: list[dict]          # Mensajes ya dentro del límite
    truncated_count: int          # Cuántos se descartaron
    tokens_before: int            # Estimación antes
    tokens_after: int             # Estimación después


class ConversationWindowService:
    """Servicio que aplica ventana deslizante inteligente al historial de conversación"""

    @staticmethod
    def estimate_tokens(text: str) -> int:
        """Estimación simple de tokens: len(texto) / TOKEN_ESTIMATE_RATIO
        
        Args:
            text: Texto a estimar
            
        Returns:
            Estimación de tokens (redondeada al superior)
        """
        if not text:
            return 0
        estimated = int(len(text.strip()) / settings.token_estimate_ratio)
        return max(estimated, 1)  # Mínimo 1 token

    @staticmethod
    def _calculate_message_tokens(message: dict) -> int:
        """Calcula tokens para un mensaje individual"""
        role_tokens = ConversationWindowService.estimate_tokens(message.get("role", ""))
        content_tokens = ConversationWindowService.estimate_tokens(message.get("content", ""))
        return role_tokens + content_tokens

    @staticmethod
    def apply_window(
        full_history: list[dict],
        system_prompt: str,
        user_message: str,
    ) -> WindowedHistory:
        """
        Aplica ventana deslizante al historial.
        
        Estrategia:
        1. Estimar tokens del sistema y mensaje actual (estos NO se truncan)
        2. Calcular espacio disponible para historial
        3. Agregar últimos N mensajes al espacio disponible
        4. Si sigue siendo muy largo, reducir N dinámicamente
        5. Loggear si hubo truncamiento
        
        Args:
            full_history: Lista completa de mensajes previos (sin el mensaje actual)
            system_prompt: Prompt del sistema
            user_message: Mensaje actual del usuario
            
        Returns:
            WindowedHistory con mensajes truncados, conteo y estimaciones de tokens
        """
        # Estimar tokens fijos (no truncables)
        system_tokens = ConversationWindowService.estimate_tokens(system_prompt)
        user_msg_tokens = ConversationWindowService.estimate_tokens(user_message)
        fixed_tokens = system_tokens + user_msg_tokens
        
        # Espacio disponible para historial
        available_tokens = settings.max_context_tokens - fixed_tokens
        
        # Si no hay espacio, retornar vacío
        if available_tokens <= 0:
            return WindowedHistory(
                messages=[],
                truncated_count=len(full_history),
                tokens_before=ConversationWindowService._calculate_total_tokens(full_history),
                tokens_after=0,
            )
        
        # Intentar agregar últimos N mensajes
        max_messages = settings.max_history_messages
        selected_messages = []
        accumulated_tokens = 0
        original_count = len(full_history)
        
        # Recorrer desde el final hacia atrás para tomar los más recientes
        for i in range(len(full_history) - 1, -1, -1):
            message = full_history[i]
            message_tokens = ConversationWindowService._calculate_message_tokens(message)
            
            # Verificar límite de mensajes
            if len(selected_messages) >= max_messages:
                break
            
            # Verificar límite de tokens
            if accumulated_tokens + message_tokens > available_tokens:
                break
            
            selected_messages.insert(0, message)  # Insertar al principio para mantener orden
            accumulated_tokens += message_tokens
        
        truncated_count = original_count - len(selected_messages)
        tokens_before = ConversationWindowService._calculate_total_tokens(full_history)
        tokens_after = accumulated_tokens
        
        return WindowedHistory(
            messages=selected_messages,
            truncated_count=truncated_count,
            tokens_before=tokens_before,
            tokens_after=tokens_after,
        )

    @staticmethod
    def _calculate_total_tokens(messages: list[dict]) -> int:
        """Calcula el total de tokens de una lista de mensajes"""
        return sum(ConversationWindowService._calculate_message_tokens(m) for m in messages)

    @staticmethod
    def log_truncation(window: WindowedHistory, user_message: str) -> None:
        """
        Loggea si se aplicó truncamiento al historial.
        
        Args:
            window: Resultado de apply_window
            user_message: Mensaje del usuario (para contexto)
        """
        if window.truncated_count > 0:
            log.info(
                f"Historial truncado | "
                f"Mensajes descartados: {window.truncated_count} | "
                f"Tokens: {window.tokens_before} → {window.tokens_after} | "
                f"Pregunta: {user_message[:80]}..."
            )
        else:
            log.debug(
                f"Historial completo dentro del límite | "
                f"Tokens: {window.tokens_after} / {settings.max_context_tokens} | "
                f"Mensajes: {len(window.messages)}"
            )
