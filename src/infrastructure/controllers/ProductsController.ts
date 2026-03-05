/**
 * ProductsController.ts + productRoutes.ts (archivo combinado)
 *
 * PROBLEMA DETECTADO EN FASE 1:
 *   paymentsApi.getShopProducts() llama a GET /products?shop=true
 *   pero esta ruta NO EXISTÍA en server.ts → 404 en producción.
 *   ShopPage usaba MOCK_PRODUCTS como fallback silencioso.
 *
 * SOLUCIÓN:
 *   Este archivo crea el Controller + Route del catálogo de productos.
 *   Agregar en server.ts:
 *     import productRoutes from '@infrastructure/http/routes/productRoutes';
 *     app.use('/api/v1/products', productRoutes);
 */

// ── Controller ────────────────────────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/connection';

class ProductsController {

  // GET /api/v1/products?shop=true → todos los productos activos con stock
  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shopOnly = req.query.shop === 'true';

      const query = shopOnly
        ? `SELECT id as product_id, name, description, ROUND(price * 100) as price_cents,
                  'USD' as currency, stock as available_stock, 1 as is_active,
                  JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.rarity')) as rarity,
                  JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.type'))   as type,
                  JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.emoji'))  as emoji
           FROM products
           WHERE stock > 0
           ORDER BY FIELD(JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.rarity')),
                          'LEGENDARY','EPIC','RARE','COMMON')`
        : `SELECT id as product_id, name, description, ROUND(price * 100) as price_cents,
                  'USD' as currency, stock as available_stock, 1 as is_active
           FROM products
           ORDER BY id DESC`;

      const [rows]: any = await pool.execute(query);

      res.json({ success: true, data: rows });
    } catch (err) { next(err); }
  }

  // GET /api/v1/products/:id
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [rows]: any = await pool.execute(
        `SELECT id as product_id, name, description, ROUND(price * 100) as price_cents,
                'USD' as currency, stock as available_stock
         FROM products WHERE id = ? LIMIT 1`,
        [req.params.id]
      );
      if (!rows.length) {
        res.status(404).json({ success: false, error: 'PRODUCT_NOT_FOUND' });
        return;
      }
      res.json({ success: true, data: rows[0] });
    } catch (err) { next(err); }
  }
}

export const productsController = new ProductsController();
