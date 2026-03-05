import { z } from 'zod';

export const rateItemSchema = z.object({
  score: z
    .number()
    .min(1, 'La calificación debe ser al menos 1 estrella')
    .max(5, 'La calificación no puede ser mayor a 5 estrellas')
});

export const itemIdSchema = z.object({
  itemId: z.string().uuid('ID de ítem inválido')
});

export type RateItemInput = z.infer<typeof rateItemSchema>;