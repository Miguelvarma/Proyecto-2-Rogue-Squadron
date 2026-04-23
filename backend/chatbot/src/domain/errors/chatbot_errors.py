"""
DOMINIO — Errores específicos del chatbot
Se lanzan desde infraestructura y se manejan en usecases.
"""


class GroqUnavailableError(Exception):
    """Groq no responde (error 5xx, conexión rechazada, etc)"""
    pass


class GroqRateLimitError(Exception):
    """Groq devuelve 429 (demasiadas solicitudes)"""
    pass


class GroqTimeoutError(Exception):
    """La solicitud supera GROQ_TIMEOUT_SECONDS"""
    pass


class ContextTooLargeError(Exception):
    """El contexto + historial supera MAX_CONTEXT_TOKENS"""
    pass
