"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetItemsQuerySchema = exports.SearchQuerySchema = void 0;
const zod_1 = require("zod");
exports.SearchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(4, 'La búsqueda debe tener al menos 4 caracteres'),
});
exports.GetItemsQuerySchema = zod_1.z.object({
    tipo: zod_1.z.enum(['Héroe', 'Arma', 'Armadura', 'Habilidad', 'Ítem', 'Épica']).optional(),
    rareza: zod_1.z.enum(['Común', 'Rara', 'Épica', 'Legendaria']).optional(),
    page: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1)).default(1),
    limit: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(100)).default(16),
});
