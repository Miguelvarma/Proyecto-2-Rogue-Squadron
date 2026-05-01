// ─── Base de datos simulada del Inventario Personal ───────────────────────
// Cada jugador tiene sus propios ítems y mazos. Los datos viven en memoria.

// Intentar requerir productos globales, pero no fallar si no está disponible
let getAllProducts = null;
try {
  ({ getAllProducts } = require('../../global-inventory/src/db/products'));
} catch (e) {
  // Fallback si el require falla
  getAllProducts = () => [];
}

// Datos mínimos de cartas para inicialización de inventario
// (fallback si getAllProducts no está disponible)
const CARD_DATA = {
  p001: { name: 'Shadowblade', type: 'Héroe', rarity: 'Legendaria' },
  p002: { name: 'Guardián de Hierro', type: 'Héroe', rarity: 'Épica' },
  p003: { name: 'Arquera Tormentosa', type: 'Héroe', rarity: 'Rara' },
  p004: { name: 'Mago del Vacío', type: 'Héroe', rarity: 'Épica' },
  p005: { name: 'Druida Ancestral', type: 'Héroe', rarity: 'Rara' },
  p006: { name: 'Paladín de la Luz', type: 'Héroe', rarity: 'Rara' },
  p007: { name: 'Berserker Salvaje', type: 'Héroe', rarity: 'Común' },
  p008: { name: 'Exploradora Élfica', type: 'Héroe', rarity: 'Común' },
  p009: { name: 'Bola de Fuego', type: 'Hechizo', rarity: 'Épica' },
  p010: { name: 'Nova de Hielo', type: 'Hechizo', rarity: 'Rara' },
  p011: { name: 'Rayo de Tormenta', type: 'Hechizo', rarity: 'Rara' },
  p012: { name: 'Toque Sanador', type: 'Hechizo', rarity: 'Común' },
  p013: { name: 'Vacío Sombrío', type: 'Hechizo', rarity: 'Legendaria' },
  p014: { name: 'Escudo Arcano', type: 'Hechizo', rarity: 'Común' },
  p015: { name: 'Tormenta de Arena', type: 'Hechizo', rarity: 'Común' },
  p016: { name: 'Meteorito Cósmico', type: 'Hechizo', rarity: 'Legendaria' },
  p017: { name: 'Maldición Ancestral', type: 'Hechizo', rarity: 'Épica' },
  p018: { name: 'Resurrección', type: 'Hechizo', rarity: 'Épica' },
  p019: { name: 'Escudo Escama de Dragón', type: 'Ítem', rarity: 'Legendaria' },
  p020: { name: 'Arco Encantado', type: 'Ítem', rarity: 'Épica' },
  p021: { name: 'Espada de Acero', type: 'Ítem', rarity: 'Común' },
  p022: { name: 'Amuleto del Nexus', type: 'Ítem', rarity: 'Rara' },
  p023: { name: 'Bastón del Sabio', type: 'Ítem', rarity: 'Épica' },
  p024: { name: 'Botas de Velocidad', type: 'Ítem', rarity: 'Común' },
  p025: { name: 'Corona del Rey Sombrío', type: 'Ítem', rarity: 'Legendaria' },
  p026: { name: 'Poción de Fuerza', type: 'Ítem', rarity: 'Común' },
  p027: { name: 'Trampa de Espinas', type: 'Trampa', rarity: 'Común' },
  p028: { name: 'Trampa de Fuego Arcano', type: 'Trampa', rarity: 'Rara' },
  p029: { name: 'Portal Trampa', type: 'Trampa', rarity: 'Épica' },
  p030: { name: 'Niebla Confusora', type: 'Trampa', rarity: 'Común' },
  p031: { name: 'Sello del Silencio', type: 'Trampa', rarity: 'Rara' },
  p032: { name: 'Trampa del Tiempo Detenido', type: 'Trampa', rarity: 'Legendaria' },
};

// IDs de cartas iniciales para nuevos jugadores — pack de 40 cartas
// Incluye todas las 32 cartas del catálogo + 8 copias adicionales de cartas legendarias/épicas
const STARTER_CARD_IDS = [
  // Héroes (8)
  'p001', 'p002', 'p003', 'p004', 'p005', 'p006', 'p007', 'p008',
  // Hechizos (10) — 9 base + 1 duplicado de p013 (Vacío Sombrío)
  'p009', 'p010', 'p011', 'p012', 'p013', 'p014', 'p015', 'p016', 'p017', 'p018', 'p013',
  // Ítems (8)
  'p019', 'p020', 'p021', 'p022', 'p023', 'p024', 'p025', 'p026',
  // Trampas (6) — 6 base
  'p027', 'p028', 'p029', 'p030', 'p031', 'p032',
  // Duplicados de cartas legendarias/épicas para poder armar mazos completos
  'p001',  // Shadowblade (2da copia)
  'p002',  // Guardián (2da copia)
  'p004',  // Mago Vacío (2da copia)
  'p009',  // Bola Fuego (2da copia)
  'p018',  // Resurrección (2da copia)
  'p022',  // Amuleto Nexus (2da copia)
  'p006',  // Paladín (2da copia)
  'p012',  // Toque Sanador (2da copia)
];

// Map<userId, { items: PlayerItem[], decks: Deck[] }>
const playerInventories = new Map();

// ─── Inicializar inventario de jugador nuevo ──────────────────────────────
const initPlayerInventory = (userId) => {
  const allProducts = getAllProducts ? getAllProducts() : [];
  const items = STARTER_CARD_IDS.map(productId => {
    const product = allProducts.find(p => p.id === productId);
    const fallback = CARD_DATA[productId] || { name: productId, type: 'Desconocido', rarity: 'Común' };
    return {
      instanceId: `item-${userId}-${productId}-${Date.now()}-${Math.random()}`,
      productId,
      name: product?.name || fallback.name,
      type: product?.type || fallback.type,
      rarity: product?.rarity || fallback.rarity,
      acquiredAt: new Date().toISOString(),
      quantity: 1,
    };
  });

  const inventory = { userId, items, decks: [] };
  playerInventories.set(userId, inventory);
  return inventory;
};

// ─── Obtener inventario (crea si no existe) ───────────────────────────────
const getPlayerInventory = (userId) => {
  if (!playerInventories.has(userId)) {
    return initPlayerInventory(userId);
  }
  return playerInventories.get(userId);
};

// ─── Enriquecer ítems con datos del catálogo global ──────────────────────
const enrichItems = (items) => {
  const allProducts = getAllProducts ? getAllProducts() : [];
  return items.map(item => {
    const product = allProducts.find(p => p.id === item.productId);
    const fallback = CARD_DATA[item.productId] || {};
    return {
      ...item,
      ...(product || {}),
      // Asegurar que siempre tenemos los datos mínimos
      name: product?.name || item.name || fallback.name || item.productId,
      type: product?.type || item.type || fallback.type || 'Desconocido',
      rarity: product?.rarity || item.rarity || fallback.rarity || 'Común',
      instanceId: item.instanceId,
      acquiredAt: item.acquiredAt,
      quantity: item.quantity,
    };
  });
};

// ─── Agregar ítem al inventario ───────────────────────────────────────────
const addItemToInventory = (userId, productId) => {
  const inventory = getPlayerInventory(userId);
  const allProducts = getAllProducts();
  const product = allProducts.find(p => p.id === productId);
  if (!product) return { error: 'Producto no encontrado en el catálogo global' };

  const existingItem = inventory.items.find(i => i.productId === productId);
  if (existingItem) {
    existingItem.quantity++;
    return { item: enrichItems([existingItem])[0] };
  }

  const newItem = {
    instanceId: `item-${userId}-${productId}-${Date.now()}`,
    productId,
    name: product.name,
    type: product.type,
    rarity: product.rarity,
    acquiredAt: new Date().toISOString(),
    quantity: 1,
  };
  inventory.items.push(newItem);
  return { item: enrichItems([newItem])[0] };
};

// ─── Mazos ────────────────────────────────────────────────────────────────
const DECK_SIZE = 30;

const createDeck = (userId, { name, cardIds }) => {
  if (!name || name.trim().length < 2) {
    return { error: 'El nombre del mazo debe tener al menos 2 caracteres' };
  }
  if (!cardIds || cardIds.length !== DECK_SIZE) {
    return { error: `El mazo debe contener exactamente ${DECK_SIZE} cartas` };
  }

  const inventory = getPlayerInventory(userId);
  const ownedProductIds = inventory.items.map(i => i.productId);

  // Validar que todas las cartas del mazo pertenecen al inventario del jugador
  const invalidCards = cardIds.filter(id => !ownedProductIds.includes(id));
  if (invalidCards.length > 0) {
    return { error: `No tienes estas cartas en tu inventario: ${invalidCards.join(', ')}` };
  }

  const deck = {
    id: `deck-${userId}-${Date.now()}`,
    userId,
    name: name.trim(),
    cardIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  inventory.decks.push(deck);
  return { deck };
};

const updateDeck = (userId, deckId, { name, cardIds }) => {
  const inventory = getPlayerInventory(userId);
  const deck = inventory.decks.find(d => d.id === deckId);
  if (!deck) return { error: 'Mazo no encontrado' };

  if (cardIds) {
    if (cardIds.length !== DECK_SIZE) {
      return { error: `El mazo debe contener exactamente ${DECK_SIZE} cartas` };
    }
    const ownedProductIds = inventory.items.map(i => i.productId);
    const invalidCards = cardIds.filter(id => !ownedProductIds.includes(id));
    if (invalidCards.length > 0) {
      return { error: `No tienes estas cartas en tu inventario: ${invalidCards.join(', ')}` };
    }
    deck.cardIds = cardIds;
  }
  if (name) deck.name = name.trim();
  deck.updatedAt = new Date().toISOString();
  return { deck };
};

const deleteDeck = (userId, deckId) => {
  const inventory = getPlayerInventory(userId);
  const idx = inventory.decks.findIndex(d => d.id === deckId);
  if (idx === -1) return { error: 'Mazo no encontrado' };
  inventory.decks.splice(idx, 1);
  return { success: true };
};

module.exports = {
  getPlayerInventory,
  enrichItems,
  addItemToInventory,
  createDeck,
  updateDeck,
  deleteDeck,
};
