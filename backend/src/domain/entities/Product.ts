export class Product {
    constructor(
    public id: number | null,
    public name: string,
    public description: string,
    public price: number,
    public stock: number
    ) {
    this.validate();
    }

    private validate() {
    if (!this.name || this.name.trim().length === 0) {
        throw new Error("El nombre del producto es obligatorio");
    }

    if (this.price <= 0) {
        throw new Error("El precio debe ser mayor a 0");
    }

    if (this.stock < 0) {
        throw new Error("El stock no puede ser negativo");
    }
    }
}