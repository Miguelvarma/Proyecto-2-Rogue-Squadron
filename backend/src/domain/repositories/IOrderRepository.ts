import { Order } from "../entities/Order";
import { OrderItem } from "../entities/OrderItem";

export interface OrderRepository {
    createOrderWithItems(
    userId: number,
    items: {
        productId: number;
        quantity: number;
        price: number;
    }[]
    ): Promise<void>;

    findByUser(userId: number): Promise<Order[]>;
}