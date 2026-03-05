"""
APLICACIÓN — Puerto: Gateway de IA
Contrato abstracto. El dominio/aplicación NUNCA llama al LLM directamente.
Solo conoce este contrato.
"""
from abc import ABC, abstractmethod


class AIGatewayPort(ABC):
    """
    Contrato para comunicación con el proveedor de IA.
    La implementación concreta está en infrastructure/gateways/.
    """

    @abstractmethod
    async def generate_response(
        self,
        system_prompt: str,
        history: list[dict],
        user_message: str,
        max_tokens: int = 500,
    ) -> str:
        """
        Genera una respuesta del LLM.
        
        Args:
            system_prompt: Contexto del sistema para el modelo.
            history: Historial previo de la conversación.
            user_message: Mensaje actual del usuario.
            max_tokens: Límite de tokens en la respuesta.
        
        Returns:
            Respuesta generada como string.
        
        Raises:
            AIGatewayError: Si el proveedor no responde o falla.
        """
        pass


class AIGatewayError(Exception):
    """Error del gateway de IA. Mapea a HTTP 503."""
    pass
