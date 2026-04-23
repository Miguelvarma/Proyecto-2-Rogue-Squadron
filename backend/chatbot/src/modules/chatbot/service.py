from src.application.usecases.manage_history import GetHistoryUseCase, ClearHistoryUseCase
from src.application.usecases.send_message import SendMessageInput, SendMessageOutput, SendMessageUseCase


class ChatbotService:
    def __init__(
        self,
        send_message_uc: SendMessageUseCase,
        get_history_uc: GetHistoryUseCase,
        clear_history_uc: ClearHistoryUseCase,
    ):
        self._send_message_uc = send_message_uc
        self._get_history_uc = get_history_uc
        self._clear_history_uc = clear_history_uc

    async def send_message(self, user_id: str, message: str) -> SendMessageOutput:
        input_data = SendMessageInput(user_id=user_id, message=message)
        return await self._send_message_uc.execute(input_data)

    def get_history(self, user_id: str) -> dict:
        return self._get_history_uc.execute(user_id)

    def clear_history(self, user_id: str) -> bool:
        return self._clear_history_uc.execute(user_id)
