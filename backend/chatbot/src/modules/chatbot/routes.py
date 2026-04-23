from fastapi import APIRouter, HTTPException

from .controller import (
    ChatHistoryResponse,
    ChatbotController,
    ClearHistoryResponse,
    SendMessageRequest,
    SendMessageResponse,
)

controller: ChatbotController | None = None


def set_controller(ctrl: ChatbotController) -> None:
    global controller
    controller = ctrl


router = APIRouter(prefix="/chatbot", tags=["Chatbot"])


@router.post("/message", response_model=SendMessageResponse)
async def send_message(payload: SendMessageRequest) -> SendMessageResponse:
    if controller is None:
        raise HTTPException(status_code=500, detail="Chatbot controller no inicializado")
    return await controller.send_message(payload)


@router.get("/history/{user_id}", response_model=ChatHistoryResponse)
def get_history(user_id: str) -> ChatHistoryResponse:
    if controller is None:
        raise HTTPException(status_code=500, detail="Chatbot controller no inicializado")
    return controller.get_history(user_id)


@router.delete("/history/{user_id}", response_model=ClearHistoryResponse)
def clear_history(user_id: str) -> ClearHistoryResponse:
    if controller is None:
        raise HTTPException(status_code=500, detail="Chatbot controller no inicializado")
    return controller.clear_history(user_id)
