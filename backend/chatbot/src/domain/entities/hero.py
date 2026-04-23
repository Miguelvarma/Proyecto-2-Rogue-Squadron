from dataclasses import dataclass, field


@dataclass
class HeroStats:
    hp: int = 0
    attack: int = 0
    defense: int = 0
    speed: int = 0
    mana: int = 0


@dataclass
class Hero:
    id: str
    name: str
    hero_type: str
    rarity: str
    stats: HeroStats
    abilities: list[str] = field(default_factory=list)
    lore: str = ""
    special_power: str = ""

    def to_summary(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.hero_type,
            "rarity": self.rarity,
            "stats": {
                "hp": self.stats.hp,
                "attack": self.stats.attack,
                "defense": self.stats.defense,
                "speed": self.stats.speed,
                "mana": self.stats.mana,
            },
            "abilities": self.abilities,
            "special_power": self.special_power,
        }
