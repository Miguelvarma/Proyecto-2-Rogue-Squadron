"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginSchema = exports.RegisterSchema = void 0;
const zod_1 = require("zod");
exports.RegisterSchema = zod_1.z.object({
    nombres: zod_1.z.string().min(2).max(50),
    apellidos: zod_1.z.string().min(2).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    apodo: zod_1.z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
    avatar: zod_1.z.string().url().optional(),
});
// NUEVO: Schema de Login
exports.LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido'),
    password: zod_1.z.string().min(1, 'Contraseña es requerida'),
});
