import re
import unicodedata


class ContextSelectorService:
    def __init__(self, keywords_map: dict[str, list[str]]):
        self._keywords_map = keywords_map

    def normalize_text(self, text: str) -> str:
        lowered = text.lower().strip()
        normalized = unicodedata.normalize("NFD", lowered)
        without_accents = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
        compact = re.sub(r"\s+", " ", without_accents)
        return compact

    def select_categories(self, question: str) -> tuple[list[str], bool]:
        normalized_question = self.normalize_text(question)
        selected: list[str] = []

        for category, keywords in self._keywords_map.items():
            for raw_keyword in keywords:
                keyword = self.normalize_text(raw_keyword)
                if keyword and keyword in normalized_question:
                    selected.append(category)
                    break

        if selected:
            # Preserva el orden definido en el mapa y elimina duplicados.
            unique = list(dict.fromkeys(selected))
            return unique, False

        return list(self._keywords_map.keys()), True
