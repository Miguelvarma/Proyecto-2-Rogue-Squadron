"""
DOMINIO — Contratos de Repositorios (Puertos)
Interfaces abstractas. El dominio SOLO conoce estos contratos,
nunca las implementaciones concretas.
"""
from abc import ABC, abstractmethod
from typing import Optional

from src.domain.entities.hero import Hero
from src.domain.entities.item import Item
from src.domain.entities.chat_message import ChatSession


class HeroRepositoryPort(ABC):
    """Contrato para acceso a datos de héroes."""

    @abstractmethod
    def find_by_id(self, hero_id: str) -> Optional[Hero]:
        pass

    @abstractmethod
    def find_by_type(self, hero_type: str) -> list[Hero]:
        pass

    @abstractmethod
    def find_by_rarity(self, rarity: str) -> list[Hero]:
        pass

    @abstractmethod
    def find_all(self) -> list[Hero]:
        pass

    @abstractmethod
    def search(self, query: str) -> list[Hero]:
        pass


class ItemRepositoryPort(ABC):
    """Contrato para acceso a datos de ítems."""

    @abstractmethod
    def find_by_id(self, item_id: str) -> Optional[Item]:
        pass

    @abstractmethod
    def find_by_type(self, item_type: str) -> list[Item]:
        pass

    @abstractmethod
    def find_compatible_with(self, hero_type: str) -> list[Item]:
        pass

    @abstractmethod
    def find_all(self) -> list[Item]:
        pass

    @abstractmethod
    def search(self, query: str) -> list[Item]:
        pass


class KnowledgeRepositoryPort(ABC):
    """Contrato para acceso al conocimiento estático del juego."""

    @abstractmethod
    def load(self) -> dict:
        pass


class ChatSessionRepositoryPort(ABC):
    """Contrato para persistencia de sesiones de chat."""

    @abstractmethod
    def find_by_user_id(self, user_id: str) -> Optional[ChatSession]:
        pass

    @abstractmethod
    def save(self, session: ChatSession) -> ChatSession:
        pass

    @abstractmethod
    def delete(self, user_id: str) -> bool:
        pass
