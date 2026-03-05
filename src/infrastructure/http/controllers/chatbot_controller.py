"""
INFRAESTRUCTURA — Controlador HTTP del Chatbot
Solo coordina Request/Response. CERO lógica de negocio aquí.
Llama a los UseCases y retorna la respuesta HTTP apropiada.
"""
from fastapi import HTTPException
from src.application.usecases.send_message import SendMessageUseCase, SendMessageInput
from src.application.usecases.manage_history import GetHistoryUseCase, ClearHistoryUseCase
from src.infrastructure.http.middlewares.validation import ChatMessageSchema


class ChatbotController:
    """
    Controlador del chatbot.
    Responsabilidad única: traducir HTTP ↔ UseCases.
    """

    def __init__(
        self,
        send_message_uc: SendMessageUseCase,
        get_history_uc: GetHistoryUseCase,
        clear_history_uc: ClearHistoryUseCase,
    ):
        self._send_message = send_message_uc
        self._get_history = get_history_uc
        self._clear_history = clear_history_uc

    async def handle_chat(self, data: ChatMessageSchema) -> dict:
        """POST /api/v1/chatbot/chat"""
        result = await self._send_message.execute(
            SendMessageInput(user_id=data.user_id, message=data.message)
        )
        return {
            "user_id": result.user_id,
            "response": result.response,
            "intent": result.intent,
            "suggestions": result.suggestions,
        }

    def handle_get_history(self, user_id: str) -> dict:
        """GET /api/v1/chatbot/history/{user_id}"""
        result = self._get_history.execute(user_id)
        if not result.history:
            raise HTTPException(status_code=404, detail="No se encontró historial para este usuario.")
        return {
            "user_id": result.user_id,
            "history": result.history,
            "message_count": result.message_count,
        }

    def handle_clear_history(self, user_id: str) -> dict:
        """DELETE /api/v1/chatbot/{user_id}"""
        self._clear_history.execute(user_id)
        return {"message": "Historial eliminado correctamente.", "user_id": user_id}
