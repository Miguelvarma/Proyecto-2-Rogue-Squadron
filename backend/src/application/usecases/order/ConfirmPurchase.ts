/**
 * ConfirmPurchase.ts — Application / Use Cases / Order
 * FIX: eliminados alias @domain (no configurados en tsconfig), reemplazados por rutas relativas.
 */

import { CartRepository }    from '../../../domain/repositories/ICartRepository';
import { OrderRepository }   from '../../../domain/repositories/IOrderRepository';
import { ProductRepository } from '../../../domain/repositories/IProductRepository';

export class ConfirmPurchase {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(userId: number) {
    const cartItems = await this.cartRepository.getCart(userId);

    if (cartItems.length === 0) {
      throw new Error('El carrito está vacío');
    }

    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) throw new Error('Producto no encontrado');
      if (product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para ${product.name}`);
      }
    }

    await this.orderRepository.createOrderWithItems(
      userId,
      cartItems.map(item => ({
        productId: item.productId,
        quantity:  item.quantity,
        price:     item.price,
      }))
    );
  }
}
