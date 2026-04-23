export class Order {
    constructor(
    public id: number | null,
    public userId: number,
    public total: number,
    public createdAt: Date = new Date()
    ) {
    if (this.total <= 0) {
        throw new Error("El total de la orden debe ser mayor a 0");
    }
    }
}