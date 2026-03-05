"""
DOMINIO — Entidad Hero
Sin dependencias externas. Solo lógica pura del negocio.
"""
from dataclasses import dataclass
from typing import Optional


@dataclass
class HeroStats:
    hp: int
    attack: str   # puede ser "10+1d6", "10+1d8", etc.
    defense: int
    speed: int
    mana: int


@dataclass
class Hero:
    id: str
    name: str
    hero_type: str          # warrior, mage, rogue, healer, tank
    rarity: str             # common, rare, epic, legendary
    stats: HeroStats
    abilities: list[str]
    lore: str
    special_power: str

    def is_legendary(self) -> bool:
        return self.rarity == "legendary"

    def get_power_rating(self) -> int:
        """Calcula el poder total del héroe — lógica de dominio pura."""
        s = self.stats
        return (s.hp // 10) + s.defense + s.speed + (s.mana // 5)

    def to_summary(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.hero_type,
            "rarity": self.rarity,
            "power_rating": self.get_power_rating(),
            "special_power": self.special_power,
        }
