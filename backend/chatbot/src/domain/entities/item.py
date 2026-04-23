from dataclasses import dataclass, field


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
    item_type: str
    rarity: str
    stats: ItemStats
    compatible_heroes: list[str] = field(default_factory=list)
    description: str = ""
    price: int = 0
    tradeable: bool = True

    def to_summary(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "type": self.item_type,
            "rarity": self.rarity,
            "description": self.description,
            "price": self.price,
            "tradeable": self.tradeable,
        }

    def is_compatible_with(self, hero_type: str) -> bool:
        normalized_type = hero_type.lower().strip()
        return (
            "all" in [t.lower().strip() for t in self.compatible_heroes]
            or normalized_type in [t.lower().strip() for t in self.compatible_heroes]
        )
