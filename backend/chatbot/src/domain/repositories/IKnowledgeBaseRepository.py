from abc import ABC, abstractmethod


class IKnowledgeBaseRepository(ABC):
    @abstractmethod
    def get_by_categoria(self, categoria: str) -> list[dict]:
        pass

    @abstractmethod
    def get_categorias_relevantes(self, keywords: list[str]) -> list[str]:
        pass

    @abstractmethod
    def get_all_categorias(self) -> list[str]:
        pass
