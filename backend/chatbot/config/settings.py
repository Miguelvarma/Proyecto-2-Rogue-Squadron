"""
CONFIG — Variables de entorno validadas con Pydantic al arrancar.
Si falta alguna variable requerida → falla rápido (fail fast).
Equivalente a la validación con Zod que pide el PDF.
"""
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # ─── App ──────────────────────────────────────────────────────────────────
    node_env: str = Field(default="development", alias="NODE_ENV")
    port: int = Field(default=8000, alias="PORT")

    # ─── IA ───────────────────────────────────────────────────────────────────
    groq_api_key: str = Field(..., alias="GROQ_API_KEY")
    ai_api_key: str | None = Field(None, alias="AI_API_KEY")
    ai_api_url: str = Field("https://api.groq.com", alias="AI_API_URL")

    # ─── CORS ─────────────────────────────────────────────────────────────────
    cors_origin: str = Field(default="http://localhost:3000", alias="CORS_ORIGIN")

    # ─── Logs ─────────────────────────────────────────────────────────────────
    log_level: str = Field(default="info", alias="LOG_LEVEL")

    # ─── Rate limiting ────────────────────────────────────────────────────────
    rate_limit_max: int = Field(default=10, alias="RATE_LIMIT_MAX")
    rate_limit_window: int = Field(default=60, alias="RATE_LIMIT_WINDOW")

    # ─── Chatbot - Límites y Configuración ────────────────────────────────────
    max_history_messages: int = Field(
        default=15,
        alias="MAX_HISTORY_MESSAGES",
    )
    max_context_tokens: int = Field(
        default=4000,
        alias="MAX_CONTEXT_TOKENS",
    )
    groq_timeout_seconds: int = Field(
        default=30,
        alias="GROQ_TIMEOUT_SECONDS",
    )
    groq_max_retries: int = Field(
        default=2,
        alias="GROQ_MAX_RETRIES",
    )
    token_estimate_ratio: float = Field(
        default=4.0,
        alias="TOKEN_ESTIMATE_RATIO",
    )

    model_config = {"env_file": ".env", "populate_by_name": True, "extra": "ignore"}


    @property
    def resolved_ai_api_key(self) -> str:
        return self.ai_api_key or self.groq_api_key


def get_settings() -> Settings:
    """
    Carga y valida la configuración al arrancar.
    Falla con error claro si falta alguna variable obligatoria.
    """
    try:
        return Settings()
    except Exception as e:
        raise RuntimeError(
            f"❌ Error de configuración — Variable de entorno faltante o inválida:\n{e}\n"
            "Revisa el archivo .env.example"
        ) from e


# Singleton de configuración
settings = get_settings()
