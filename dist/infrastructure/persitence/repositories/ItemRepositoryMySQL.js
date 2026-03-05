"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepositoryMySQL = void 0;
const Item_1 = require("../../../domain/entities/Item");
const database_1 = require("../database");
class ItemRepositoryMySQL {
    async findById(id) {
        const connection = (0, database_1.getConnection)();
        const [rows] = await connection.query('SELECT * FROM items WHERE id = ? AND activo = 1', [id]);
        if (rows.length === 0)
            return null;
        return this.mapToDomain(rows[0]);
    }
    async findAll(filters) {
        const { page, limit } = filters;
        const connection = (0, database_1.getConnection)();
        const offset = (page - 1) * limit;
        const [rows] = await connection.query('SELECT * FROM items WHERE activo = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
        const [countResult] = await connection.query('SELECT COUNT(*) as total FROM items WHERE activo = 1');
        const items = rows.map(row => this.mapToDomain(row));
        const total = countResult[0].total;
        return { items, total };
    }
    async search(query) {
        const connection = (0, database_1.getConnection)();
        const searchTerm = `%${query}%`;
        const [rows] = await connection.query(`SELECT * FROM items 
       WHERE activo = 1 
       AND (
         nombre LIKE ? OR 
         tipo LIKE ? OR 
         descripcion LIKE ? OR
         habilidades LIKE ? OR
         efectos LIKE ?
       )
       ORDER BY 
         CASE 
           WHEN nombre LIKE ? THEN 1
           WHEN nombre LIKE ? THEN 2
           ELSE 3
         END
       LIMIT 50`, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, `${query}%`, searchTerm]);
        return rows.map(row => this.mapToDomain(row));
    }
    async save(item) {
        const connection = (0, database_1.getConnection)();
        const data = item.toPersistence();
        await connection.query(`INSERT INTO items 
       (id, nombre, tipo, rareza, imagen, descripcion, habilidades, efectos, 
        ataque, defensa, user_id, en_subasta, en_mazo_activo, activo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            data.id,
            data.nombre,
            data.tipo,
            data.rareza,
            data.imagen || null,
            data.descripcion,
            JSON.stringify(data.habilidades),
            JSON.stringify(data.efectos),
            data.ataque,
            data.defensa,
            data.userId || null,
            data.enSubasta ? 1 : 0,
            data.enMazoActivo ? 1 : 0,
            data.activo ? 1 : 0,
            data.createdAt,
            data.updatedAt,
        ]);
        return item;
    }
    async update(item) {
        const connection = (0, database_1.getConnection)();
        const data = item.toPersistence();
        await connection.query(`UPDATE items 
       SET nombre = ?, tipo = ?, rareza = ?, imagen = ?, descripcion = ?,
           habilidades = ?, efectos = ?, ataque = ?, defensa = ?,
           en_subasta = ?, en_mazo_activo = ?, activo = ?, 
           deleted_at = ?, updated_at = ?
       WHERE id = ?`, [
            data.nombre,
            data.tipo,
            data.rareza,
            data.imagen || null,
            data.descripcion,
            JSON.stringify(data.habilidades),
            JSON.stringify(data.efectos),
            data.ataque,
            data.defensa,
            data.enSubasta ? 1 : 0,
            data.enMazoActivo ? 1 : 0,
            data.activo ? 1 : 0,
            data.deletedAt,
            new Date(),
            data.id,
        ]);
        return item;
    }
    async delete(id) {
        const connection = (0, database_1.getConnection)();
        const [result] = await connection.query('DELETE FROM items WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
    mapToDomain(row) {
        // Verifica si ya es objeto o si necesita parseo
        const habilidades = typeof row.habilidades === 'string'
            ? JSON.parse(row.habilidades)
            : row.habilidades;
        const efectos = typeof row.efectos === 'string'
            ? JSON.parse(row.efectos)
            : row.efectos;
        return Item_1.Item.fromPersistence({
            id: row.id,
            nombre: row.nombre,
            tipo: row.tipo,
            rareza: row.rareza,
            imagen: row.imagen || undefined,
            descripcion: row.descripcion,
            habilidades: habilidades, // ← Ya sea objeto o array
            efectos: efectos, // ← Ya sea objeto o array
            ataque: row.ataque,
            defensa: row.defensa,
            userId: row.user_id || undefined,
            enSubasta: Boolean(row.en_subasta),
            enMazoActivo: Boolean(row.en_mazo_activo),
            activo: Boolean(row.activo),
            deletedAt: row.deleted_at || undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        });
    }
}
exports.ItemRepositoryMySQL = ItemRepositoryMySQL;
