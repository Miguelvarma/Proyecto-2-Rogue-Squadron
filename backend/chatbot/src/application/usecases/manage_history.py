from dataclasses import dataclass
from typing import Optional

from src.domain.entities.chat_message import ChatSession
from src.domain.repositories.contracts import ChatSessionRepositoryPort


@dataclass
class GetHistoryOutput:
    user_id: str
    messages: list[dict]


class GetHistoryUseCase:
    def __init__(self, session_repo: ChatSessionRepositoryPort):
        self._session_repo = session_repo

    def execute(self, user_id: str) -> dict:
        session = self._session_repo.find_by_user_id(user_id)
        if session is None:
            return {
                "user_id": user_id,
                "messages": [],
            }

        return {
            "user_id": session.user_id,
            "messages": [message.to_dict() for message in session.messages],
        }


class ClearHistoryUseCase:
    def __init__(self, session_repo: ChatSessionRepositoryPort):
        self._session_repo = session_repo

    def execute(self, user_id: str) -> bool:
        return self._session_repo.delete(user_id)
