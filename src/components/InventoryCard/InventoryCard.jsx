import "./InventoryCard.css";

export default function InventoryCard({ item }) {
  return (
    <button className="inv-card" type="button">
      <div className="inv-card__topline" data-rarity={item.rarity} />
      <div className="inv-card__art" data-type={item.type}>
        <div className="inv-card__mana">{item.mana}</div>
        <div className="inv-card__qty">x{item.qty}</div>
        <div className="inv-card__icon" aria-hidden="true">
          {item.icon ?? "🎴"}
        </div>
      </div>

      <div className="inv-card__info">
        <div className="inv-card__name">{item.name}</div>
        <div className="inv-card__meta">
          <span className="inv-card__type">{item.type}</span>
          <span className="inv-card__rarity">{item.rarity}</span>
        </div>
      </div>
    </button>
  );
}