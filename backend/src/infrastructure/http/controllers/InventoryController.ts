import { Request, Response, NextFunction } from 'express';
import { SearchItems } from '../../../application/usecases/inventory/SearchItem';
import { GetItems } from '../../../application/usecases/inventory/GetItem';
import { GetItemById } from '../../../application/usecases/inventory/GetItemById';
import { DeleteItem } from '../../../application/usecases/inventory/DeleteItem';
import { AuthRequest } from '../middlewares/auth.middleware';
import { logInventoryEvent } from '../../logging/logger';

export class InventoryController {
  constructor(
    private readonly searchItems: SearchItems,
    private readonly getItems: GetItems,
    private readonly getItemById: GetItemById,
    private readonly deleteItem: DeleteItem
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

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tipo, rareza, page, limit } = req.query;

      const result = await this.getItems.execute({
        tipo: tipo as string | undefined,
        rareza: rareza as string | undefined,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 16,
      });

      res.status(200).json(result);
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