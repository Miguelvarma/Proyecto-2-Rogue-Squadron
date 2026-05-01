const router = require('express').Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getPlayerInventory, enrichItems,
  addItemToInventory, createDeck, updateDeck, deleteDeck,
} = require('../db/inventory');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// ─── GET /api/v1/inventory ─────────────────────────────────────────────────
// Retorna los ítems del jugador autenticado con paginación (16/pág) y filtros.
router.get('/', (req, res) => {
  const { page = 1, limit = 16, type, rarity, search } = req.query;
  const userId = req.user.id;

  const inventory = getPlayerInventory(userId);
  let items = enrichItems(inventory.items);

  // Filtros
  if (type && type !== 'all') items = items.filter(i => i.type === type);
  if (rarity && rarity !== 'all') items = items.filter(i => i.rarity === rarity);
  if (search && search.trim().length >= 4) {
    const q = search.trim().toLowerCase();
    items = items.filter(i =>
      i.name?.toLowerCase().includes(q) ||
      i.type?.toLowerCase().includes(q) ||
      i.rarity?.toLowerCase().includes(q) ||
      i.description?.toLowerCase().includes(q)
    );
  }

  // Paginación
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(32, Math.max(1, parseInt(limit)));
  const total = items.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const start = (pageNum - 1) * limitNum;
  const paginated = items.slice(start, start + limitNum);

  res.json({
    items: paginated,
    pagination: { page: pageNum, limit: limitNum, total, totalPages, hasNext: pageNum < totalPages, hasPrev: pageNum > 1 },
    summary: {
      totalItems: inventory.items.length,
      totalDecks: inventory.decks.length,
    },
  });
});

// ─── GET /api/v1/inventory/decks ───────────────────────────────────────────
router.get('/decks', (req, res) => {
  const inventory = getPlayerInventory(req.user.id);
  res.json({ decks: inventory.decks });
});

// ─── POST /api/v1/inventory/decks ─────────────────────────────────────────
// Crea un nuevo mazo con exactamente 30 cartas del inventario del jugador.
router.post('/decks', (req, res) => {
  const { name, cardIds } = req.body;
  const result = createDeck(req.user.id, { name, cardIds });
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ message: 'Mazo creado exitosamente', deck: result.deck });
});

// ─── PUT /api/v1/inventory/decks/:id ──────────────────────────────────────
router.put('/decks/:id', (req, res) => {
  const { name, cardIds } = req.body;
  const result = updateDeck(req.user.id, req.params.id, { name, cardIds });
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ message: 'Mazo actualizado', deck: result.deck });
});

// ─── DELETE /api/v1/inventory/decks/:id ───────────────────────────────────
router.delete('/decks/:id', (req, res) => {
  const result = deleteDeck(req.user.id, req.params.id);
  if (result.error) return res.status(404).json({ error: result.error });
  res.json({ message: 'Mazo eliminado' });
});

// ─── POST /api/v1/inventory/items ─────────────────────────────────────────
// Agregar un ítem al inventario (usado por otros servicios o desde admin)
router.post('/items', (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ error: 'productId requerido' });
  const result = addItemToInventory(req.user.id, productId);
  if (result.error) return res.status(400).json({ error: result.error });
  res.status(201).json({ message: 'Ítem agregado al inventario', item: result.item });
});

module.exports = router;
