import { Request, Response } from 'express';
import { RatingService } from '../../../domain/services/RatingService';
import { z } from 'zod';

// Definir el tipo de Request con usuario
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    rol?: string;
  };
}

const rateSchema = z.object({
  score: z
    .number()
    .min(1, 'La calificación debe ser al menos 1 estrella')
    .max(5, 'La calificación no puede ser mayor a 5 estrellas')
});

// ✅ CORREGIDO: Extrae el número del UUID (ej: "item-1" → 1)
const productIdSchema = z.object({
  id: z.string().transform((val) => {
    // Si es solo número, lo convierte directamente
    if (/^\d+$/.test(val)) {
      return parseInt(val, 10);
    }
    
    // Si tiene formato "item-1", "product-2", etc.
    const match = val.match(/\d+$/);
    if (!match) {
      throw new Error('ID de producto debe terminar en número (ej: item-1)');
    }
    return parseInt(match[0], 10);
  })
});

export class RatingController {
  constructor(private ratingService: RatingService) {}

  // POST /api/v1/products/:id/rate
  rateProduct = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 1. Verificar autenticación
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ 
          success: false,
          error: 'No autenticado' 
        });
      }

      // 2. Validar y convertir productId (string → number)
      const { id: productIdStr } = req.params;
      const productIdResult = productIdSchema.safeParse({ id: productIdStr });
      
      if (!productIdResult.success) {
        return res.status(400).json({ 
          success: false,
          error: 'ID de producto inválido',
          details: productIdResult.error.issues[0].message
        });
      }
      
      const productId = productIdResult.data.id; // ✅ Ahora es number

      // 3. Validar score
      const scoreResult = rateSchema.safeParse(req.body);
      
      if (!scoreResult.success) {
        return res.status(400).json({ 
          success: false,
          error: 'Calificación inválida',
          details: scoreResult.error.issues[0].message
        });
      }
      
      const { score } = scoreResult.data;

      // 4. Ejecutar caso de uso (espera number)
      const result = await this.ratingService.rateProduct(
        userId, 
        productId,  // ✅ Ahora es number
        score
      );
      
      return res.json({
        success: true,
        message: result.message,
        rating: result.rating
      });
      
    } catch (error) {
      console.error('Error en rateProduct:', error);
      
      if (error instanceof Error) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Error interno del servidor' 
      });
    }
  };

  // GET /api/v1/products/:id/rating
  getProductRating = async (req: AuthenticatedRequest, res: Response) => {
    try {
      // 1. Validar y convertir productId (string → number)
      const { id: productIdStr } = req.params;
      const productIdResult = productIdSchema.safeParse({ id: productIdStr });
      
      if (!productIdResult.success) {
        return res.status(400).json({ 
          success: false,
          error: 'ID de producto inválido',
          details: productIdResult.error.issues[0].message
        });
      }
      
      const productId = productIdResult.data.id; // ✅ Ahora es number

      // 2. Obtener calificaciones del producto
      const rating = await this.ratingService.getProductRating(productId); // ✅ number
      
      // 3. Si hay usuario autenticado, obtener su voto personal
      let userRating = null;
      if (req.user?.id) {
        const userVote = await this.ratingService.getUserRating(
          req.user.id, 
          productId  // ✅ number
        );
        userRating = userVote?.score || null;
      }

      // 4. Responder
      return res.json({
        success: true,
        average: rating.average,
        count: rating.count,
        userRating
      });
      
    } catch (error) {
      console.error('Error en getProductRating:', error);
      
      if (error instanceof Error) {
        return res.status(400).json({ 
          success: false,
          error: error.message 
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: 'Error al obtener calificaciones' 
      });
    }
  };
}