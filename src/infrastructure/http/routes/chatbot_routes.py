"""
INFRAESTRUCTURA — Rutas HTTP del módulo Chatbot
Define los endpoints y aplica middlewares (rate limit, validación).
Sigue el estándar del PDF: /api/v1/chatbot/[recurso]
"""
from fastapi import APIRouter, Depends
from src.infrastructure.http.middlewares.validation import ChatMessageSchema
from src.infrastructure.http.middlewares.rate_limiter import rate_limit_middleware
from src.infrastructure.http.controllers.chatbot_controller import ChatbotController

router = APIRouter(prefix="/api/v1/chatbot", tags=["Chatbot"])

# El controlador se inyecta desde el contenedor (main.py)
_controller: ChatbotController | None = None


def set_controller(controller: ChatbotController):
    global _controller
    _controller = controller


def get_controller() -> ChatbotController:
    return _controller


@router.post("/chat", summary="Enviar mensaje al chatbot")
async def chat(
    data: ChatMessageSchema,
    controller: ChatbotController = Depends(get_controller),
):
    """
    Envía un mensaje al NexusBot.
    - Validación Zod-equivalente con Pydantic (400 si falla).
    - Rate limit: 10 mensajes/60s por user_id.
    - El dato llega limpio y validado al controlador.
    """
    await rate_limit_middleware(None, data.user_id)
    return await controller.handle_chat(data)


@router.get("/history/{user_id}", summary="Obtener historial de conversación")
async def get_history(
    user_id: str,
    controller: ChatbotController = Depends(get_controller),
):
    """Retorna el historial de conversación del usuario."""
    return controller.handle_get_history(user_id)


@router.delete("/{user_id}", summary="Limpiar historial de conversación")
async def clear_history(
    user_id: str,
    controller: ChatbotController = Depends(get_controller),
):
    """Elimina el historial de conversación del usuario."""
    return controller.handle_clear_history(user_id)


@router.get("/health", summary="Health check del módulo chatbot")
async def health():
    return {"status": "ok", "module": "chatbot", "version": "2.0.0"}
