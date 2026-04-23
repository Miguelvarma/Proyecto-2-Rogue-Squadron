from typing import Optional

from src.domain.entities.chat_message import ChatSession
from src.domain.repositories.contracts import ChatSessionRepositoryPort


class InMemoryChatSessionRepository(ChatSessionRepositoryPort):
    """Repositorio en memoria para sesiones de chat."""

    def __init__(self):
        self._storage: dict[str, ChatSession] = {}

    def find_by_user_id(self, user_id: str) -> Optional[ChatSession]:
        return self._storage.get(user_id)

    def save(self, session: ChatSession) -> ChatSession:
        self._storage[session.user_id] = session
        return session

    def delete(self, user_id: str) -> bool:
        return self._storage.pop(user_id, None) is not None
