import { Request, Response, NextFunction } from 'express';
import { SearchItems } from '../../../application/usecases/inventory/SearchItem';
import { GetItems } from '../../../application/usecases/inventory/GetItem';
import { GetItemById } from '../../../application/usecases/inventory/GetItemById';
import { DeleteItem } from '../../../application/usecases/inventory/DeleteItem';
import { CreateItem } from '../../../application/usecases/inventory/CreateItem';
import { UpdateItem } from '../../../application/usecases/inventory/UpdateItem';
import { SoftDeleteItem } from '../../../application/usecases/inventory/SoftDeleteItem';
import { ReactivateItem } from '../../../application/usecases/inventory/ReactivateItem';
import { GetUserInventory } from '../../../application/usecases/inventory/GetUserInventory';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logInventoryEvent } from '../../logging/logger';
import { ItemFilters } from '../../../domain/repositories/IItemRepository';

export class InventoryController {
  constructor(
    private readonly searchItems: SearchItems,
    private readonly getItems: GetItems,
    private readonly getItemById: GetItemById,
    private readonly deleteItem: DeleteItem,
    private readonly createItem: CreateItem,
    private readonly updateItem: UpdateItem,
    private readonly softDeleteItem: SoftDeleteItem,
    private readonly reactivateItem: ReactivateItem,
    private readonly getUserInventoryUseCase: GetUserInventory,
  ) {}

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q } = req.query;
      const result = await this.searchItems.execute(q as string);

      logInventoryEvent('search', {
        query: q,
        results: result.total,
      });

      res.status(200).json({
        ...result,
        message: result.total === 0 ? 'No se encontraron resultados' : undefined,
      });
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const filters: ItemFilters = {
        tipo: req.query.tipo as string,
        rareza: req.query.rareza as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 16
      };
      
      const result = await this.getItems.execute(filters);
      res.json(result);
    } catch (error) {
      console.error('Error en list:', error);
      res.status(500).json({ error: 'Error al obtener items' });
    }
  };

  getGlobalInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ItemFilters = {
        tipo: req.query.tipo as string,
        rareza: req.query.rareza as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 16
      };

      const result = await this.getItems.execute(filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getUserInventory = async (req: AuthRequest & Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const filters: ItemFilters = {
        tipo: req.query.tipo as string,
        rareza: req.query.rareza as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 16
      };

      const result = await this.getUserInventoryUseCase.execute(userId, filters);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.getItemById.execute(id);

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: AuthRequest & Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log('🔍 [InventoryController.create] Datos recibidos:', req.body);
      console.log('🔍 [InventoryController.create] Usuario:', req.user);
      
      const result = await this.createItem.execute(req.body);
      
      console.log('✅ [InventoryController.create] Item creado exitosamente:', result.id);

      logInventoryEvent('item.created', {
        itemId: result.id,
        nombre: result.nombre,
      });

      res.status(201).json({
        message: 'Ítem creado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('❌ [InventoryController.create] Error:', error);
      next(error);
    }
  };

  update = async (
    req: AuthRequest & Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.updateItem.execute(id, req.body);

      logInventoryEvent('item.updated', {
        itemId: id,
        userId: req.user!.userId,
      });

      res.json({
        message: 'Ítem actualizado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (
    req: AuthRequest & Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.softDeleteItem.execute(id);

      logInventoryEvent('item.softDeleted', {
        itemId: id,
        userId: req.user!.userId,
        deletedAt: result.deletedAt,
      });

      res.json({
        message: 'Ítem eliminado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  reactivate = async (
    req: AuthRequest & Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.reactivateItem.execute(id);

      logInventoryEvent('item.reactivated', {
        itemId: id,
        userId: req.user!.userId,
        reactivatedAt: result.reactivatedAt,
      });

      res.json({
        message: 'Ítem reactivado exitosamente',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (
    req: AuthRequest & Request<{ id: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const result = await this.deleteItem.execute(id, userId);

      logInventoryEvent('item.deleted', {
        itemId: id,
        userId,
        deletedAt: result.deletedAt,
      });

      res.status(200).json({
        message: 'Ítem eliminado exitosamente',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  };
}