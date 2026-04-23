// domain/repositories/IRatingRepository.ts
import { Rating } from '../entities/Rating';

export interface IRatingRepository {
  // Buscar calificación de un usuario para un ítem
  findByUserAndItem(userId: string, itemId: string): Promise<Rating | null>;
  
  // Crear nueva calificación
  create(rating: Rating): Promise<void>;
  
  // Actualizar calificación existente
  update(id: string, score: number): Promise<void>;
  
  // Obtener promedio y total de calificaciones de un ítem
  getAverageByItem(itemId: string): Promise<{ average: number; count: number }>;
  getAverageByProduct(productId: string): Promise<{ average: number; count: number }>;
  // Verificar si un usuario ya calificó
  exists(userId: string, itemId: string): Promise<boolean>;

}