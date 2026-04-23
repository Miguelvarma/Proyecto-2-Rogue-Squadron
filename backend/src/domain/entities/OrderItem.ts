export class OrderItem {
    constructor(
    public orderId: number,
    public productId: number,
    public quantity: number,
    public price: number
    ) {
    if (this.quantity <= 0) {
        throw new Error("Cantidad inválida");
    }
    }
}