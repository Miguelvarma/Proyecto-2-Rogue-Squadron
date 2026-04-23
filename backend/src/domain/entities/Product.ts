// backend/src/domain/entities/Product.ts
export class Product {
  constructor(
    public id: number | null,
    public name: string,
    public description: string,
    public price_cents: number,
    public currency: string,
    public rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY',
    public type: string,
    public emoji: string,
    public available_stock: number,
    public is_active: boolean,
    public image?: string
  ) {
    this.validate();
  }

  private validate() {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error("El nombre del producto es obligatorio");
    }
    if (this.price_cents < 0) {
      throw new Error("El precio no puede ser negativo");
    }
    if (this.available_stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price_cents: this.price_cents,
      currency: this.currency,
      rarity: this.rarity,
      type: this.type,
      emoji: this.emoji,
      available_stock: this.available_stock,
      is_active: this.is_active,
      image: this.image
    };
  }
}