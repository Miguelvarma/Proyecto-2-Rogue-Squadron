"""
DOMINIO — Entidad ChatMessage
Representa un mensaje en la conversación del chatbot.
"""
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import Literal


class ChatIntent(Enum):
    HEROES = "hero_query"
    ITEMS = "item_query"
    HERO_STATS = "hero_stats"
    MECANICAS = "how_to_play"
    CUENTA = "account_help"
    SUBASTA = "market_query"
    SOPORTE = "support"
    FAQ = "faq"
    GREETING = "greeting"
    HELP = "help"
    GENERAL = "general"


@dataclass
class ChatMessage:
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = field(default_factory=datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            "role": self.role,
            "content": self.content,
        }


@dataclass
class ChatSession:
    user_id: str
    messages: list[ChatMessage] = field(default_factory=list)

    def add_message(self, role: str, content: str) -> ChatMessage:
        msg = ChatMessage(role=role, content=content)
        self.messages.append(msg)
        return msg

    def get_history_for_llm(self) -> list[dict]:
        """Retorna historial en formato para el LLM, sin el system prompt."""
        return [m.to_dict() for m in self.messages if m.role != "system"]

    def message_count(self) -> int:
        return len([m for m in self.messages if m.role == "user"])
