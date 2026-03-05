import { ProductRepository } from "../../../domain/repositories/IProductRepository";
import { CartRepository } from "../../../domain/repositories/ICartRepository";

export class AddProductToCart {
    
    constructor(private readonly cartRepository: CartRepository,
        private readonly productRepository: ProductRepository
    ){}

    async execute(userId: number, productId: number, quantity: number) {

    if (quantity <= 0) {
        throw new Error("Cantidad inválida");
    }

    const product = await this.productRepository.findById(productId);

    if (!product) {
        throw new Error("Producto no encontrado");
    }

    if (product.stock < quantity) {
        throw new Error("Stock insuficiente");
    }

    await this.cartRepository.addProduct(userId, productId, quantity);
}
}