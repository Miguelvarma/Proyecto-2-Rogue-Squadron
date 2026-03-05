"""
INFRAESTRUCTURA — Repositorio de sesiones en memoria
En producción se reemplaza por Redis sin tocar el dominio ni los casos de uso.
"""
from typing import Optional
from src.domain.entities.chat_message import ChatSession
from src.domain.repositories.contracts import ChatSessionRepositoryPort


class InMemoryChatSessionRepository(ChatSessionRepositoryPort):
    """
    Adaptador de repositorio de sesiones.
    Almacena en memoria. Reemplazable por Redis.
    """

    def __init__(self):
        self._sessions: dict[str, ChatSession] = {}

    def find_by_user_id(self, user_id: str) -> Optional[ChatSession]:
        return self._sessions.get(user_id)

    def save(self, session: ChatSession) -> ChatSession:
        self._sessions[session.user_id] = session
        return session

    def delete(self, user_id: str) -> bool:
        if user_id in self._sessions:
            del self._sessions[user_id]
            return True
        return False
