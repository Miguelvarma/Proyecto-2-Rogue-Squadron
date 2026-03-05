"""
APLICACIÓN — Casos de Uso: GetHistory y ClearHistory
"""
from dataclasses import dataclass
from src.domain.repositories.contracts import ChatSessionRepositoryPort


@dataclass
class GetHistoryOutput:
    user_id: str
    history: list[dict]
    message_count: int


class GetHistoryUseCase:
    def __init__(self, session_repo: ChatSessionRepositoryPort):
        self._sessions = session_repo

    def execute(self, user_id: str) -> GetHistoryOutput:
        session = self._sessions.find_by_user_id(user_id)
        if session is None:
            return GetHistoryOutput(user_id=user_id, history=[], message_count=0)

        return GetHistoryOutput(
            user_id=user_id,
            history=session.get_history_for_llm(),
            message_count=session.message_count(),
        )


class ClearHistoryUseCase:
    def __init__(self, session_repo: ChatSessionRepositoryPort):
        self._sessions = session_repo

    def execute(self, user_id: str) -> bool:
        return self._sessions.delete(user_id)
