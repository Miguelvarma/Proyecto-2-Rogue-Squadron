import { z } from 'zod';

export const RegisterSchema = z.object({
  nombres: z.string().min(2).max(50),
  apellidos: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  apodo: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  avatar: z.string().url().optional(),
});

// NUEVO: Schema de Login
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});