"""
MAIN — Punto de entrada de la aplicación
Aquí se construye el contenedor de dependencias:
conecta las capas sin que el dominio sepa de infraestructura.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from config.settings import settings

# ─── Adaptadores de infraestructura ──────────────────────────────────────────
from src.infrastructure.repositories.knowledge_repositories import (
    InMemoryHeroRepository,
    InMemoryItemRepository,
)
from src.infrastructure.repositories.session_repository import InMemoryChatSessionRepository
from src.infrastructure.gateways.groq_gateway import GroqAIGateway

# ─── Casos de uso ─────────────────────────────────────────────────────────────
from src.domain.services.chatbot_service import ChatbotDomainService
from src.application.usecases.send_message import SendMessageUseCase
from src.application.usecases.manage_history import GetHistoryUseCase, ClearHistoryUseCase

# ─── Capa HTTP ────────────────────────────────────────────────────────────────
from src.infrastructure.http.controllers.chatbot_controller import ChatbotController
from src.infrastructure.http.routes.chatbot_routes import router as chatbot_router, set_controller

# ─── Logging ──────────────────────────────────────────────────────────────────
from src.infrastructure.logging.logger import get_logger

logger = get_logger("nexus.main")


def create_app() -> FastAPI:
    app = FastAPI(
        title="Nexus Battles V — Chatbot Module",
        description="Módulo de chatbot con arquitectura hexagonal. Héroes e ítems.",
        version="2.0.0",
    )

    # ── CORS — solo origen registrado (no wildcard en producción) ──────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.cors_origin],
        allow_credentials=True,
        allow_methods=["GET", "POST", "DELETE"],
        allow_headers=["Content-Type", "Authorization"],
    )

    # ── Manejo global de errores de validación (400 con detalle) ──────────────
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request, exc):
        errors = [
            {"field": ".".join(str(l) for l in e["loc"]), "message": e["msg"]}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=400,
            content={"error": "ValidationError", "details": errors},
        )

    # ── Contenedor de dependencias (Dependency Injection) ─────────────────────
    # Repositorios (adaptadores)
    hero_repo = InMemoryHeroRepository()
    item_repo = InMemoryItemRepository()
    session_repo = InMemoryChatSessionRepository()

    # Gateway de IA (adaptador)
    ai_gateway = GroqAIGateway(api_key=settings.groq_api_key)

    # Servicio de dominio
    domain_service = ChatbotDomainService()

    # Casos de uso (inyectamos contratos, no implementaciones)
    send_message_uc = SendMessageUseCase(
        hero_repo=hero_repo,
        item_repo=item_repo,
        session_repo=session_repo,
        ai_gateway=ai_gateway,
        domain_service=domain_service,
    )
    get_history_uc = GetHistoryUseCase(session_repo=session_repo)
    clear_history_uc = ClearHistoryUseCase(session_repo=session_repo)

    # Controlador
    controller = ChatbotController(
        send_message_uc=send_message_uc,
        get_history_uc=get_history_uc,
        clear_history_uc=clear_history_uc,
    )
    set_controller(controller)

    # ── Registrar rutas ───────────────────────────────────────────────────────
    app.include_router(chatbot_router)

    @app.get("/")
    def root():
        return {
            "module": "nexus-chatbot",
            "version": "2.0.0",
            "status": "running",
            "docs": "/docs",
        }

    logger.info("Nexus Chatbot module initialized — Hexagonal Architecture v2.0")
    return app


app = create_app()
