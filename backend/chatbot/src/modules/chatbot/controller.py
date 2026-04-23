from pydantic import BaseModel
from src.modules.chatbot.service import ChatbotService


class SendMessageRequest(BaseModel):
    user_id: str
    message: str


class SendMessageResponse(BaseModel):
    user_id: str
    response: str
    intent: str
    suggestions: list[str]


class ChatHistoryResponse(BaseModel):
    user_id: str
    messages: list[dict]


class ClearHistoryResponse(BaseModel):
    success: bool


class ChatbotController:
    def __init__(self, chatbot_service: ChatbotService):
        self._chatbot_service = chatbot_service

    async def send_message(self, payload: SendMessageRequest) -> SendMessageResponse:
        result = await self._chatbot_service.send_message(
            user_id=payload.user_id,
            message=payload.message,
        )
        return SendMessageResponse(
            user_id=result.user_id,
            response=result.response,
            intent=result.intent,
            suggestions=result.suggestions,
        )

    def get_history(self, user_id: str) -> ChatHistoryResponse:
        history = self._chatbot_service.get_history(user_id=user_id)
        return ChatHistoryResponse(**history)

    def clear_history(self, user_id: str) -> ClearHistoryResponse:
        success = self._chatbot_service.clear_history(user_id=user_id)
        return ClearHistoryResponse(success=success)
