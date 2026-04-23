import { z } from 'zod';

export const SearchQuerySchema = z.object({
  q: z.string().min(4, 'La búsqueda debe tener al menos 4 caracteres'),
});

export const GetItemsQuerySchema = z.object({
  tipo:   z.enum(['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica']).optional(),
  rareza: z.enum(['Común', 'Rara', 'Épica', 'Legendaria']).optional(),
  page:  z.string().default('1').transform(Number).pipe(z.number().min(1)),
  limit: z.string().default('16').transform(Number).pipe(z.number().min(1).max(100)),
});

export const CreateItemSchema = z.object({
  nombre: z.string().min(2).max(100),
  tipo: z.enum(['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica']),
  rareza: z.enum(['Común', 'Rara', 'Épica', 'Legendaria']).optional(),
  imagen: z.string().url().optional(),
  descripcion: z.string().max(1000).optional(),
  habilidades: z.array(z.string()).optional(),
  efectos: z.array(z.string()).optional(),
  ataque: z.number().int().min(0).optional(),
  defensa: z.number().int().min(0).optional(),
  userId: z.string().uuid().optional(),
});

export const UpdateItemSchema = z.object({
  nombre: z.string().min(2).max(100).optional(),
  tipo: z.enum(['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica']).optional(),
  rareza: z.enum(['Común', 'Rara', 'Épica', 'Legendaria']).optional(),
  imagen: z.string().url().optional(),
  descripcion: z.string().max(1000).optional(),
  habilidades: z.array(z.string()).optional(),
  efectos: z.array(z.string()).optional(),
  ataque: z.number().int().min(0).optional(),
  defensa: z.number().int().min(0).optional(),
});