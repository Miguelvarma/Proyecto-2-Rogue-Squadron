from abc import ABC, abstractmethod


class AIGatewayError(Exception):
    """Excepción genérica para fallos del gateway de IA."""
    pass


class AIGatewayPort(ABC):
    """Puerto de entrada para cualquier gateway de IA externo."""

    @abstractmethod
    async def generate_response(
        self,
        system_prompt: str,
        history: list[dict],
        user_message: str,
    ) -> str:
        pass
