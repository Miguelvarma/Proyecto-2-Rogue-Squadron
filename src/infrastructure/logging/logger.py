"""
INFRAESTRUCTURA — Logging estructurado en JSON
Equivalente a Winston del PDF. Todos los eventos críticos se loggean aquí.
"""
import logging
import json
from datetime import datetime


class JSONFormatter(logging.Formatter):
    """Formateador de logs en JSON estructurado para auditoría."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "module": record.name,
            "message": record.getMessage(),
        }
        # Incluir campos extra si existen
        for key in ("user_id", "intent", "ip", "request_id", "event"):
            if hasattr(record, key):
                log_data[key] = getattr(record, key)

        return json.dumps(log_data, ensure_ascii=False)


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


# ─── Logger del módulo chatbot ────────────────────────────────────────────────
chatbot_logger = get_logger("nexus.chatbot")


# ─── Helpers de log para eventos críticos (sección 7.3 del PDF) ──────────────

def log_chat_message(user_id: str, intent: str, success: bool):
    chatbot_logger.info(
        "chat.message",
        extra={"event": "chat.message", "user_id": user_id, "intent": intent, "success": success}
    )

def log_rate_limit_hit(user_id: str, route: str):
    chatbot_logger.warning(
        "security.rateLimitHit",
        extra={"event": "security.rateLimitHit", "user_id": user_id, "route": route}
    )

def log_content_filter(user_id: str):
    chatbot_logger.warning(
        "security.contentFiltered",
        extra={"event": "security.contentFiltered", "user_id": user_id}
    )

def log_ai_error(user_id: str, error: str):
    chatbot_logger.error(
        "ai.gateway.error",
        extra={"event": "ai.gateway.error", "user_id": user_id, "error": error}
    )
