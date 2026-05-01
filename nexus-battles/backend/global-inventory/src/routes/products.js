const router = require('express').Router();
const {
  getAllProducts, getProductById,
  searchProducts, ratings, comments, getAvgRating,
} = require('../db/products');
const { authMiddleware } = require('../middleware/authMiddleware');

// ─── GET /api/v1/products ──────────────────────────────────────────────────
// Paginación: 16 por página. Filtros: type, rarity, search (mín 4 chars).
router.get('/', (req, res) => {
  const { page = 1, limit = 16, search, type, rarity } = req.query;
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(32, Math.max(1, parseInt(limit)));

  let result = getAllProducts();

  // Filtro de búsqueda (mínimo 4 caracteres)
  if (search && search.trim().length >= 4) {
    result = searchProducts(search.trim());
  }

  // Filtro por tipo
  if (type && type !== 'all') {
    result = result.filter(p => p.type === type);
  }

  // Filtro por rareza
  if (rarity && rarity !== 'all') {
    result = result.filter(p => p.rarity === rarity);
  }

  const total = result.length;
  const totalPages = Math.ceil(total / limitNum);
  const start = (pageNum - 1) * limitNum;
  const paginated = result.slice(start, start + limitNum).map(p => ({
    ...p,
    avgRating: getAvgRating(p.id),
    totalComments: (comments[p.id] || []).length,
  }));

  res.json({
    products: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
    filters: { types: ['Héroe', 'Hechizo', 'Ítem', 'Trampa'], rarities: ['Común', 'Rara', 'Épica', 'Legendaria'] },
  });
});

// ─── GET /api/v1/products/:id ──────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({
      error: 'Producto no encontrado',
      code: 'PRODUCT_NOT_FOUND',
    });
  }

  const productComments = (comments[product.id] || []).slice().reverse(); // más recientes primero
  const userRating = req.headers.authorization
    ? ratings[product.id]?.[req.query.userId] || null
    : null;

  res.json({
    product: {
      ...product,
      avgRating: getAvgRating(product.id),
      totalRatings: Object.keys(ratings[product.id] || {}).length,
      comments: productComments,
    },
  });
});

// ─── POST /api/v1/products/:id/ratings ────────────────────────────────────
// Un usuario solo puede calificar un producto UNA VEZ.
router.post('/:id/ratings', authMiddleware, (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const { stars } = req.body;
  if (!stars || stars < 1 || stars > 5 || !Number.isInteger(stars)) {
    return res.status(400).json({ error: 'La calificación debe ser un número entero entre 1 y 5' });
  }

  const userId = req.user.id;
  const existingRating = ratings[product.id][userId];

  if (existingRating !== undefined) {
    return res.status(409).json({
      error: 'Ya calificaste este producto. Solo puedes hacerlo una vez.',
      yourRating: existingRating,
    });
  }

  ratings[product.id][userId] = stars;

  res.status(201).json({
    message: 'Calificación registrada',
    avgRating: getAvgRating(product.id),
    yourRating: stars,
  });
});

// ─── POST /api/v1/products/:id/comments ───────────────────────────────────
router.post('/:id/comments', authMiddleware, (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const { text, images = [] } = req.body;
  if (!text || text.trim().length < 1) {
    return res.status(400).json({ error: 'El comentario no puede estar vacío' });
  }
  if (!Array.isArray(images) || images.length > 5) {
    return res.status(400).json({ error: 'Máximo 5 imágenes por comentario' });
  }

  const comment = {
    id: `cmt-${Date.now()}`,
    userId: req.user.id,
    apodo: req.user.apodo,
    text: text.trim(),
    images,
    date: new Date().toISOString(),
    stars: ratings[product.id][req.user.id] || null,
  };

  comments[product.id].push(comment);

  res.status(201).json({ message: 'Comentario publicado', comment });
});

// ─── DELETE /api/v1/products/:id/comments/:commentId ──────────────────────
router.delete('/:id/comments/:commentId', authMiddleware, (req, res) => {
  const product = getProductById(req.params.id);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const productComments = comments[product.id] || [];
  const idx = productComments.findIndex(c => c.id === req.params.commentId);

  if (idx === -1) return res.status(404).json({ error: 'Comentario no encontrado' });
  if (productComments[idx].userId !== req.user.id) {
    return res.status(403).json({ error: 'No puedes eliminar comentarios de otros jugadores' });
  }

  comments[product.id].splice(idx, 1);
  res.json({ message: 'Comentario eliminado' });
});

module.exports = router;
