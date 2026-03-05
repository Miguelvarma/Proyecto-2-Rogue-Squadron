"""
DOMINIO — Entidad Item
Sin dependencias externas. Solo lógica pura del negocio.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class ItemStats:
    attack_bonus: int = 0
    defense_bonus: int = 0
    speed_bonus: int = 0
    hp_bonus: int = 0
    mana_bonus: int = 0


@dataclass
class Item:
    id: str
    name: str
    item_type: str       # weapon, armor, accessory, consumable
    rarity: str          # common, rare, epic, legendary
    stats: ItemStats
    compatible_heroes: list[str]   # tipos de héroe compatibles
    description: str
    price: int           # precio en moneda del juego
    tradeable: bool = True

    def is_compatible_with(self, hero_type: str) -> bool:
        """Verifica si el ítem es compatible con un tipo de héroe."""
        return "all" in self.compatible_heroes or hero_type in self.compatible_heroes

    def get_total_bonus(self) -> int:
        """Suma todos los bonos del ítem."""
        s = self.stats
        return s.attack_bonus + s.defense_bonus + s.speed_bonus + (s.hp_bonus // 10) + s.mana_bonus

    def to_summary(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.item_type,
            "rarity": self.rarity,
            "total_bonus": self.get_total_bonus(),
            "price": self.price,
            "tradeable": self.tradeable,
        }
