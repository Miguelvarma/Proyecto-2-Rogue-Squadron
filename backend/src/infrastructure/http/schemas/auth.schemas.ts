import { z } from 'zod';

export const RegisterSchema = z.object({
  nombres: z.string().min(2, 'Nombres debe tener al menos 2 caracteres').max(50),
  apellidos: z.string().min(2, 'Apellidos debe tener al menos 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña debe tener al menos 8 caracteres'),
  apodo: z.string()
    .min(3, 'Apodo debe tener al menos 3 caracteres')
    .max(20, 'Apodo debe tener máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Apodo solo puede contener letras, números y guiones bajos'),
  avatar: z.string().url('Avatar debe ser una URL válida').optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
});