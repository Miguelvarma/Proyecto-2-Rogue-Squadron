"""
INFRAESTRUCTURA — Middleware: Rate Limiter
Controla la tasa de peticiones por usuario.
"""
import time
from fastapi import Request, HTTPException


class RateLimiter:
    """
    Rate limiter en memoria.
    En producción se reemplaza por Redis sin cambiar el middleware.
    """

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self._max_requests = max_requests
        self._window = window_seconds
        self._store: dict[str, list[float]] = {}

    def is_allowed(self, key: str) -> bool:
        now = time.time()
        if key not in self._store:
            self._store[key] = []

        # Limpiar timestamps fuera de la ventana
        self._store[key] = [t for t in self._store[key] if now - t < self._window]

        if len(self._store[key]) >= self._max_requests:
            return False

        self._store[key].append(now)
        return True

    def reset(self, key: str):
        self._store.pop(key, None)


# Instancia global del rate limiter
chat_rate_limiter = RateLimiter(max_requests=10, window_seconds=60)


async def rate_limit_middleware(request: Request, user_id: str):
    """
    Dependencia FastAPI para rate limiting por user_id.
    Lanza HTTPException 429 si se supera el límite.
    """
    if not chat_rate_limiter.is_allowed(user_id):
        raise HTTPException(
            status_code=429,
            detail="Has enviado demasiados mensajes. Espera un momento antes de continuar."
        )
