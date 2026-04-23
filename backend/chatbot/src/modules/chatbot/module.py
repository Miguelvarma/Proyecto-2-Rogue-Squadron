from dataclasses import dataclass
from fastapi import APIRouter, FastAPI

from config.settings import settings
from src.infrastructure.gateways.groq_gateway import GroqAIGateway
from src.infrastructure.repositories.MySQLKnowledgeBaseRepository import MySQLKnowledgeBaseRepository
from src.infrastructure.repositories.session_repository import InMemoryChatSessionRepository
from src.domain.services.chatbot_service import ChatbotDomainService
from src.domain.services.ContextSelectorService import ContextSelectorService
from src.domain.services.context_keywords_map import CONTEXT_KEYWORDS_MAP
from src.application.usecases.send_message import SendMessageUseCase
from src.application.usecases.manage_history import GetHistoryUseCase, ClearHistoryUseCase
from src.modules.chatbot.controller import ChatbotController
from src.modules.chatbot.routes import router, set_controller
from src.modules.chatbot.service import ChatbotService


@dataclass(frozen=True)
class ChatbotModule:
    service: ChatbotService
    router: APIRouter


def create_chatbot_module() -> ChatbotModule:
    knowledge_base_repo = MySQLKnowledgeBaseRepository()
    context_selector = ContextSelectorService(CONTEXT_KEYWORDS_MAP)
    session_repo = InMemoryChatSessionRepository()
    ai_gateway = GroqAIGateway(
        api_key=settings.resolved_ai_api_key,
        api_url=settings.ai_api_url,
    )
    domain_service = ChatbotDomainService()

    send_message_uc = SendMessageUseCase(
        session_repo=session_repo,
        ai_gateway=ai_gateway,
        domain_service=domain_service,
        context_selector=context_selector,
        knowledge_base_repo=knowledge_base_repo,
    )
    get_history_uc = GetHistoryUseCase(session_repo=session_repo)
    clear_history_uc = ClearHistoryUseCase(session_repo=session_repo)

    service = ChatbotService(
        send_message_uc=send_message_uc,
        get_history_uc=get_history_uc,
        clear_history_uc=clear_history_uc,
    )

    controller = ChatbotController(
        chatbot_service=service,
    )
    set_controller(controller)

    return ChatbotModule(service=service, router=router)


def register_chatbot(app: FastAPI) -> ChatbotModule:
    module = create_chatbot_module()
    app.state.chatbot_service = module.service
    app.include_router(module.router)
    return module
