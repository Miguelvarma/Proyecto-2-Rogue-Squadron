import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().min(4, 'La búsqueda debe tener al menos 4 caracteres'),
});

export const GetItemsQuerySchema = z.object({
  tipo: z.enum(['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica']).optional(),
  rareza: z.enum(['Común', 'Rara', 'Épica', 'Legendaria']).optional(),
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(16),
});