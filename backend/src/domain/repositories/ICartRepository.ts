import { CartItem } from "../entities/Cart"

export interface CartRepository {
    addProduct(userId:number, productId:number, quantity:number): Promise<void>
    getCart(userId:number): Promise<CartItem[]>
    updateQuantity(id:number, quantity:number): Promise<void>
    removeProduct(id:number): Promise<void>
}