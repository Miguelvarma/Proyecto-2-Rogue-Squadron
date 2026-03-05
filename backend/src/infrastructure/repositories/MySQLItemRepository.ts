import { pool } from "../database/connection";
import { Item } from "../../domain/entities/Item";
import { IItemRepository, ItemFilters } from "../../domain/repositories/IItemRepository";
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface ItemRow extends RowDataPacket {
  id: string;
  nombre: string;
  tipo: string;
  rareza: string;
  imagen: string | null;
  descripcion: string;
  habilidades: string;
  efectos: string;
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

export class MySQLItemRepository implements IItemRepository {
  
  async findById(id: string): Promise<Item | null> {
    const [rows] = await pool.query<ItemRow[]>(
      'SELECT * FROM items WHERE id = ? AND activo = true',
      [id]
    );
    
    if (rows.length === 0) return null;
    
    return this.mapToEntity(rows[0]);
  }
  
  async findAll(filters: ItemFilters): Promise<{ items: Item[]; total: number }> {
    // Construir query base
    let query = 'SELECT * FROM items WHERE activo = true';
    let countQuery = 'SELECT COUNT(*) as total FROM items WHERE activo = true';
    
    const params: any[] = [];
    const countParams: any[] = [];
    
    // Aplicar filtros
    if (filters.tipo) {
      query += ' AND tipo = ?';
      countQuery += ' AND tipo = ?';
      params.push(filters.tipo);
      countParams.push(filters.tipo);
    }
    
    if (filters.rareza) {
      query += ' AND rareza = ?';
      countQuery += ' AND rareza = ?';
      params.push(filters.rareza);
      countParams.push(filters.rareza);
    }
    
    if (filters.userId) {
      query += ' AND user_id = ?';
      countQuery += ' AND user_id = ?';
      params.push(filters.userId);
      countParams.push(filters.userId);
    }
    
    // Paginación
    const limit = filters.limit || 16;
    const offset = ((filters.page || 1) - 1) * limit;
    
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    console.log('📝 Query findAll:', query);
    console.log('📌 Params:', params);
    
    // Ejecutar queries
    const [rows] = await pool.query<ItemRow[]>(query, params);
    const [countResult] = await pool.query<any[]>(countQuery, countParams);
    
    const total = countResult[0]?.total || 0;
    const items = rows.map(row => this.mapToEntity(row));
    
    return { items, total };
  }
  
  async search(query: string): Promise<Item[]> {
    const searchQuery = `%${query}%`;
    const [rows] = await pool.query<ItemRow[]>(
      `SELECT * FROM items 
       WHERE activo = true 
       AND (nombre LIKE ? OR descripcion LIKE ?)
       LIMIT 50`,
      [searchQuery, searchQuery]
    );
    
    return rows.map(row => this.mapToEntity(row));
  }
  
  async save(item: Item): Promise<Item> {
    // ✅ Usar toPersistence() para obtener todas las propiedades
    const props = item.toPersistence();
    
    await pool.query<ResultSetHeader>(
      `INSERT INTO items (
        id, nombre, tipo, rareza, imagen, descripcion, 
        habilidades, efectos, ataque, defensa, user_id,
        en_subasta, en_mazo_activo, activo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        props.id,
        props.nombre,
        props.tipo,
        props.rareza,
        props.imagen || null,  // ✅ Manejar null correctamente
        props.descripcion,
        JSON.stringify(props.habilidades || []),
        JSON.stringify(props.efectos || []),
        props.ataque || 0,
        props.defensa || 0,
        props.userId || null,   // ✅ Manejar null
        props.enSubasta || false,
        props.enMazoActivo || false,
        props.activo !== undefined ? props.activo : true,
        props.createdAt || new Date(),
        props.updatedAt || new Date()
      ]
    );
    
    return item;
  }
  
  async update(item: Item): Promise<Item> {
    // ✅ Usar toPersistence() para obtener todas las propiedades
    const props = item.toPersistence();
    
    await pool.query<ResultSetHeader>(
      `UPDATE items SET
        nombre = ?, tipo = ?, rareza = ?, imagen = ?,
        descripcion = ?, habilidades = ?, efectos = ?,
        ataque = ?, defensa = ?, user_id = ?,
        en_subasta = ?, en_mazo_activo = ?, updated_at = ?
      WHERE id = ? AND activo = true`,
      [
        props.nombre,
        props.tipo,
        props.rareza,
        props.imagen || null,  // ✅ Manejar null
        props.descripcion,
        JSON.stringify(props.habilidades || []),
        JSON.stringify(props.efectos || []),
        props.ataque || 0,
        props.defensa || 0,
        props.userId || null,   // ✅ Manejar null
        props.enSubasta || false,
        props.enMazoActivo || false,
        new Date(),              // ✅ Siempre actualizar updated_at
        props.id
      ]
    );
    
    return item;
  }
  
  async delete(id: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE items SET activo = false, deleted_at = ? WHERE id = ?',
      [new Date(), id]
    );
    
    return result.affectedRows > 0;
  }
  
  private mapToEntity(row: ItemRow): Item {
    // ✅ Usar el constructor de la clase Item con todas las propiedades
    return new Item({
      id: row.id,
      nombre: row.nombre,
      tipo: row.tipo as any,
      rareza: row.rareza as any,
      imagen: row.imagen || undefined,
      descripcion: row.descripcion,
      habilidades: this.parseJSON(row.habilidades, []),
      efectos: this.parseJSON(row.efectos, []),
      ataque: row.ataque,
      defensa: row.defensa,
      userId: row.user_id || undefined,
      enSubasta: row.en_subasta,
      enMazoActivo: row.en_mazo_activo,
      activo: row.activo,
      deletedAt: row.deleted_at || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
  
  private parseJSON(data: any, defaultValue: any[]): any[] {
    if (!data) return defaultValue;
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      console.error('Error parseando JSON:', data);
      return defaultValue;
    }
  }
}