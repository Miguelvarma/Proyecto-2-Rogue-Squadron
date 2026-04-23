// backend/src/infrastructure/http/controllers/ProductsController.ts
import { Request, Response } from "express";
import { MySQLProductRepository } from "../../repositories/MySQLProductRepository";

const productRepository = new MySQLProductRepository();

export class ProductsController {
  
  async listar(req: Request, res: Response) {
    try {
      const products = await productRepository.findAll();
      res.json({
        success: true,
        count: products.length,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          stock: p.stock,
          rarity: p.rarity,
          type: p.type,
          emoji: p.emoji,
          image: p.image
        }))
      });
    } catch (error: any) {
      console.error("Error:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async crear(req: Request, res: Response) {
    try {
      const { name, description, price, stock, rarity, type, emoji, image } = req.body;
      
      console.log("📦 Creando producto:", { name, description, price, rarity, type });
      
      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        rarity: rarity || 'COMMON',
        type: type || 'ITEM',
        emoji: emoji || '📦',
        is_active: true,
        image: image || ''
      };
      
      const product = await productRepository.create(productData);
      
      res.status(201).json({
        success: true,
        message: `✅ Producto "${name}" creado`,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          rarity: product.rarity,
          type: product.type,
          emoji: product.emoji,
          image: product.image
        }
      });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // ✅ AGREGAR MÉTODO ACTUALIZAR
  async actualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, price, stock, rarity, type, emoji, image } = req.body;
      
      console.log("✏️ Actualizando producto ID:", id);
      
      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        rarity: rarity || 'COMMON',
        type: type || 'ITEM',
        emoji: emoji || '📦',
        image: image || ''
      };
      
      const product = await productRepository.update(parseInt(id), productData);
      
      res.json({
        success: true,
        message: `✅ Producto "${name}" actualizado`,
        product: {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          rarity: product.rarity,
          type: product.type,
          emoji: product.emoji,
          image: product.image
        }
      });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async eliminar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await productRepository.delete(parseInt(id));
      res.json({ success: true, message: "✅ Producto eliminado" });
    } catch (error: any) {
      console.error("❌ Error:", error.message);
      res.status(400).json({ success: false, error: error.message });
    }
  }
}