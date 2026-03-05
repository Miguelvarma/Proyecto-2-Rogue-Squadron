"""
INFRAESTRUCTURA — Repositorios en memoria (JSON)
Implementa los contratos del dominio.
En producción esto se reemplaza por MySQL sin tocar el dominio.
"""
import json
import os
from typing import Optional

from src.domain.entities.hero import Hero, HeroStats
from src.domain.entities.item import Item, ItemStats
from src.domain.repositories.contracts import HeroRepositoryPort, ItemRepositoryPort


def _load_json(filename: str) -> dict:
    base = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
    path = os.path.join(base, "knowledge_base", filename)
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


class InMemoryHeroRepository(HeroRepositoryPort):
    """
    Adaptador de repositorio — lee desde knowledge_base/heroes.json.
    Implementa el contrato HeroRepositoryPort del dominio.
    """

    def __init__(self):
        self._heroes: dict[str, Hero] = {}
        self._load()

    def _load(self):
        data = _load_json("heroes.json")
        for raw in data.get("heroes", []):
            s = raw["stats"]
            stats = HeroStats(
                hp=s.get("vida", s.get("hp", 0)),
                attack=s.get("ataque", s.get("attack", "10")),
                defense=s.get("defensa", s.get("defense", 0)),
                speed=s.get("poder", s.get("speed", 0)),
                mana=s.get("poder", s.get("mana", 0)),
            )
            hero = Hero(
                id=raw["id"],
                name=raw["name"],
                hero_type=raw["hero_type"],
                rarity=raw["rarity"],
                stats=stats,
                abilities=raw.get("abilities", []),
                lore=raw.get("lore", ""),
                special_power=raw.get("special_power", ""),
            )
            self._heroes[hero.id] = hero

    def find_by_id(self, hero_id: str) -> Optional[Hero]:
        return self._heroes.get(hero_id)

    def find_by_type(self, hero_type: str) -> list[Hero]:
        return [h for h in self._heroes.values() if h.hero_type == hero_type]

    def find_by_rarity(self, rarity: str) -> list[Hero]:
        return [h for h in self._heroes.values() if h.rarity == rarity]

    def find_all(self) -> list[Hero]:
        return list(self._heroes.values())

    def search(self, query: str) -> list[Hero]:
        q = query.lower()
        return [
            h for h in self._heroes.values()
            if q in h.name.lower() or q in h.hero_type.lower() or q in h.lore.lower()
        ]


class InMemoryItemRepository(ItemRepositoryPort):
    """
    Adaptador de repositorio — lee desde knowledge_base/items.json.
    Implementa el contrato ItemRepositoryPort del dominio.
    """

    def __init__(self):
        self._items: dict[str, Item] = {}
        self._load()

    def _load(self):
        data = _load_json("items.json")

        # Ítems
        for raw in data.get("items", []):
            item = Item(
                id=raw["id"],
                name=raw["name"],
                item_type="item",
                rarity="rare",
                stats=ItemStats(),
                compatible_heroes=[raw.get("hero_type", "all")],
                description=raw.get("efecto", ""),
                price=0,
                tradeable=raw.get("tradeable", True),
            )
            self._items[item.id] = item

        # Armas
        for raw in data.get("weapons", []):
            item = Item(
                id=raw["id"],
                name=raw["name"],
                item_type="weapon",
                rarity="common",
                stats=ItemStats(),
                compatible_heroes=[raw.get("hero_type", "all")],
                description=raw.get("efecto", ""),
                price=0,
                tradeable=True,
            )
            self._items[item.id] = item

        # Armaduras
        for raw in data.get("armor", []):
            item = Item(
                id=raw["id"],
                name=raw["name"],
                item_type="armor",
                rarity="common",
                stats=ItemStats(),
                compatible_heroes=[raw.get("hero_type", "all")],
                description=raw.get("efecto", ""),
                price=0,
                tradeable=True,
            )
            self._items[item.id] = item

    def find_by_id(self, item_id: str) -> Optional[Item]:
        return self._items.get(item_id)

    def find_by_type(self, item_type: str) -> list[Item]:
        return [i for i in self._items.values() if i.item_type == item_type]

    def find_compatible_with(self, hero_type: str) -> list[Item]:
        return [i for i in self._items.values() if i.is_compatible_with(hero_type)]

    def find_all(self) -> list[Item]:
        return list(self._items.values())

    def search(self, query: str) -> list[Item]:
        q = query.lower()
        return [
            i for i in self._items.values()
            if q in i.name.lower() or q in i.item_type.lower() or q in i.description.lower()
        ]
