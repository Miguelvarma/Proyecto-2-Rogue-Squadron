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
from src.modules.chatbot import register_chatbot

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

    # ── Registrar el módulo global de Chatbot ─────────────────────────────────
    register_chatbot(app)

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
