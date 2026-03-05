"""
INFRAESTRUCTURA — Gateway de IA: Groq
Implementación concreta del contrato AIGatewayPort.
SOLO este archivo conoce la librería groq.
"""
import os
from groq import AsyncGroq
from src.application.ports.ai_gateway_port import AIGatewayPort, AIGatewayError


class GroqAIGateway(AIGatewayPort):
    """
    Adaptador para el proveedor de IA Groq.
    Implementa AIGatewayPort. Intercambiable por OpenAI, Anthropic, etc.
    sin tocar el dominio ni los casos de uso.
    """

    MODEL = "llama-3.3-70b-versatile"

    def __init__(self, api_key: str):
        self._client = AsyncGroq(api_key=api_key)

    async def generate_response(
        self,
        system_prompt: str,
        history: list[dict],
        user_message: str,
        max_tokens: int = 500,
    ) -> str:
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(history)
        messages.append({"role": "user", "content": user_message})

        try:
            response = await self._client.chat.completions.create(
                model=self.MODEL,
                messages=messages,
                max_tokens=max_tokens,
                temperature=0.7,
            )
            return response.choices[0].message.content

        except Exception as e:
            raise AIGatewayError(f"Groq gateway error: {str(e)}") from e
