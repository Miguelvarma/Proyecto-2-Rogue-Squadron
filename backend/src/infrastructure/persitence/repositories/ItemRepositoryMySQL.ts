import { IItemRepository,ItemFilters } from '../../../domain/repositories/IItemRepository';
import { Item } from '../../../domain/entities/Item';
import { getConnection } from '../database';
import { RowDataPacket } from 'mysql2';

interface ItemRow extends RowDataPacket {
  id: string;
  nombre: string;
  tipo: string;
  rareza: string;
  imagen: string | null;
  descripcion: string;
  habilidades: string; // JSON
  efectos: string; // JSON
  ataque: number;
  defensa: number;
  user_id: string | null;
  en_subasta: boolean;
  en_mazo_activo: boolean;
  activo: boolean;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class ItemRepositoryMySQL implements IItemRepository {
  async findById(id: string): Promise<Item | null> {
    const connection = getConnection();
    
    const [rows] = await connection.query<ItemRow[]>(
      'SELECT * FROM items WHERE id = ? AND activo = 1',
      [id]
    );

    if (rows.length === 0) return null;

    return this.mapToDomain(rows[0]);
  }

async findAll(
  filters: ItemFilters
): Promise<{ items: Item[]; total: number }> {

  const { page, limit } = filters;

  const connection = getConnection();
  const offset = (page - 1) * limit;

    const [rows] = await connection.query<ItemRow[]>(
      'SELECT * FROM items WHERE activo = 1 ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const [countResult] = await connection.query<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM items WHERE activo = 1'
    );

    const items = rows.map(row => this.mapToDomain(row));
    const total = countResult[0].total;

    return { items, total };
  }

  async search(query: string): Promise<Item[]> {
    const connection = getConnection();
    const searchTerm = `%${query}%`;

    const [rows] = await connection.query<ItemRow[]>(
      `SELECT * FROM items 
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
       LIMIT 50`,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, `${query}%`, searchTerm]
    );

    return rows.map(row => this.mapToDomain(row));
  }

  async save(item: Item): Promise<Item> {
    const connection = getConnection();
    const data = item.toPersistence();

    await connection.query(
      `INSERT INTO items 
       (id, nombre, tipo, rareza, imagen, descripcion, habilidades, efectos, 
        ataque, defensa, user_id, en_subasta, en_mazo_activo, activo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
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
      ]
    );

    return item;
  }

  async update(item: Item): Promise<Item> {
    const connection = getConnection();
    const data = item.toPersistence();

    await connection.query(
      `UPDATE items 
       SET nombre = ?, tipo = ?, rareza = ?, imagen = ?, descripcion = ?,
           habilidades = ?, efectos = ?, ataque = ?, defensa = ?,
           en_subasta = ?, en_mazo_activo = ?, activo = ?, 
           deleted_at = ?, updated_at = ?
       WHERE id = ?`,
      [
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
      ]
    );

    return item;
  }

  async delete(id: string): Promise<boolean> {
    const connection = getConnection();

    const [result] = await connection.query(
      'DELETE FROM items WHERE id = ?',
      [id]
    );

    return (result as any).affectedRows > 0;
  }

  private mapToDomain(row: ItemRow): Item {
    return Item.fromPersistence({
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo as any,
      rareza: row.rareza as any,
      imagen: row.imagen || undefined,
      descripcion: row.descripcion,
      habilidades: JSON.parse(row.habilidades),
      efectos: JSON.parse(row.efectos),
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