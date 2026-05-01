// ─── Base de datos simulada del Inventario Global ─────────────────────────
// 32 productos (2 páginas de 16) con sus respectivos ratings y comentarios en memoria.

const products = [
  // ── HÉROES ────────────────────────────────────────────────────────────────
  { id: 'p001', name: 'Shadowblade', type: 'Héroe', rarity: 'Legendaria',
    stats: { atk: 85, def: 45, hp: 120, mana: 8 },
    abilities: ['Golpe Sombra', 'Velo de Oscuridad'],
    effects: 'Ignora el 30% de la defensa enemiga al atacar. Gana 5 ATK por cada enemigo derrotado.',
    description: 'Un asesino nacido en las sombras del Nexus. Su hoja absorbe la esencia de cada enemigo caído, haciéndolo más letal con cada batalla. Nadie conoce su rostro; solo conocen su obra.',
    price: 5000, image: 'https://picsum.photos/seed/shadow01/300/400' },

  { id: 'p002', name: 'Guardián de Hierro', type: 'Héroe', rarity: 'Épica',
    stats: { atk: 45, def: 90, hp: 200, mana: 6 },
    abilities: ['Escudo Inquebrantable', 'Provocar'],
    effects: 'Reduce el daño recibido en un 25%. Todos los enemigos deben atacarle si está en el campo.',
    description: 'La última línea de defensa del Nexus. Su armadura fue forjada con el metal de las estrellas caídas. Ningún ataque ha conseguido derribarlo.',
    price: 2500, image: 'https://picsum.photos/seed/guardian02/300/400' },

  { id: 'p003', name: 'Arquera Tormentosa', type: 'Héroe', rarity: 'Rara',
    stats: { atk: 70, def: 35, hp: 90, mana: 4 },
    abilities: ['Flecha Rápida', 'Lluvia de Flechas'],
    effects: 'Puede atacar dos veces por turno. Lluvia de Flechas inflige 35 ATK a todos los enemigos.',
    description: 'Sus flechas nunca yerran el blanco. Criada en las montañas del norte, domina el viento para guiar sus proyectiles con precisión sobrehumana.',
    price: 1200, image: 'https://picsum.photos/seed/archer03/300/400' },

  { id: 'p004', name: 'Mago del Vacío', type: 'Héroe', rarity: 'Épica',
    stats: { atk: 95, def: 20, hp: 70, mana: 10 },
    abilities: ['Explosión Arcana', 'Portal del Vacío'],
    effects: 'Sus hechizos ignoran resistencia mágica. Portal del Vacío exilia a un enemigo por 2 turnos.',
    description: 'Ha cruzado el vacío entre dimensiones y regresado con poder incomprensible. Sus ojos brillan con la oscuridad del espacio entre mundos.',
    price: 2800, image: 'https://picsum.photos/seed/mage04/300/400' },

  { id: 'p005', name: 'Druida Ancestral', type: 'Héroe', rarity: 'Rara',
    stats: { atk: 40, def: 60, hp: 150, mana: 7 },
    abilities: ['Sanación Natural', 'Llamada de la Bestia'],
    effects: 'Regenera 15 HP al inicio de cada turno. Invoca una bestia salvaje de 50 ATK al activar su habilidad.',
    description: 'Guardián de los bosques primigenios del Nexus. Su conexión con la naturaleza le otorga poder sobre la vida misma.',
    price: 1100, image: 'https://picsum.photos/seed/druid05/300/400' },

  { id: 'p006', name: 'Paladín de la Luz', type: 'Héroe', rarity: 'Rara',
    stats: { atk: 55, def: 70, hp: 160, mana: 6 },
    abilities: ['Juicio Divino', 'Aura Sagrada'],
    effects: 'Aura Sagrada cura 20 HP a todos los aliados por turno. Juicio Divino inflinge daño doble a enemigos malditos.',
    description: 'Campeón de la luz en la oscuridad del Nexus. Su fe es su escudo y su justicia es su espada.',
    price: 1000, image: 'https://picsum.photos/seed/paladin06/300/400' },

  { id: 'p007', name: 'Berserker Salvaje', type: 'Héroe', rarity: 'Común',
    stats: { atk: 80, def: 25, hp: 100, mana: 3 },
    abilities: ['Furia Salvaje', 'Carga Bestial'],
    effects: 'Daño aumenta 10% por cada 20% de HP perdido. Carga Bestial aturde al enemigo 1 turno.',
    description: 'La rabia es su armadura y su arma. Cuanto más sangra, más peligroso se vuelve. Un espíritu guerrero sin igual.',
    price: 400, image: 'https://picsum.photos/seed/berser07/300/400' },

  { id: 'p008', name: 'Exploradora Élfica', type: 'Héroe', rarity: 'Común',
    stats: { atk: 50, def: 40, hp: 95, mana: 4 },
    abilities: ['Sigilo', 'Emboscada'],
    effects: 'Primer ataque desde Sigilo siempre crítico (+100% daño). Puede volver al Sigilo una vez por turno.',
    description: 'Veloz y silenciosa como el viento entre los árboles del Bosque Eterno del Nexus.',
    price: 350, image: 'https://picsum.photos/seed/elf08/300/400' },

  // ── HECHIZOS ──────────────────────────────────────────────────────────────
  { id: 'p009', name: 'Bola de Fuego', type: 'Hechizo', rarity: 'Épica',
    stats: { atk: 120, def: 0, hp: 0, mana: 9 },
    abilities: [],
    effects: 'Inflige 120 de daño de fuego. Quema al objetivo por 20 de daño adicional durante 3 turnos.',
    description: 'El hechizo de ataque más temido del Nexus. Consume al enemigo en llamas abrasadoras que no se pueden apagar.',
    price: 2200, image: 'https://picsum.photos/seed/fireball09/300/400' },

  { id: 'p010', name: 'Nova de Hielo', type: 'Hechizo', rarity: 'Rara',
    stats: { atk: 80, def: 0, hp: 0, mana: 7 },
    abilities: [],
    effects: 'Inflige 80 de daño de hielo. Congela al objetivo por 1 turno completo impidiendo sus acciones.',
    description: 'Una explosión de frío absoluto que detiene hasta las moléculas del objetivo. Nadie escapa del frío del Nexus.',
    price: 900, image: 'https://picsum.photos/seed/ice10/300/400' },

  { id: 'p011', name: 'Rayo de Tormenta', type: 'Hechizo', rarity: 'Rara',
    stats: { atk: 90, def: 0, hp: 0, mana: 6 },
    abilities: [],
    effects: 'Inflige 90 de daño eléctrico. 25% de probabilidad de aturdir al objetivo por 1 turno.',
    description: 'Un rayo directo del ojo de la tormenta eterna que azota el cielo del Nexus desde el principio de los tiempos.',
    price: 950, image: 'https://picsum.photos/seed/thunder11/300/400' },

  { id: 'p012', name: 'Toque Sanador', type: 'Hechizo', rarity: 'Común',
    stats: { atk: 0, def: 0, hp: 60, mana: 3 },
    abilities: [],
    effects: 'Restaura 60 HP al objetivo aliado elegido. Si el objetivo está a menos del 20% HP, restaura 90 HP.',
    description: 'La magia de sanación más básica pero más efectiva del Nexus. Salva vidas cuando más se necesita.',
    price: 200, image: 'https://picsum.photos/seed/heal12/300/400' },

  { id: 'p013', name: 'Vacío Sombrío', type: 'Hechizo', rarity: 'Legendaria',
    stats: { atk: 0, def: 0, hp: 0, mana: 12 },
    abilities: [],
    effects: 'Drena el 40% del HP máximo del objetivo y lo transfiere al lanzador. No puede ser resistido.',
    description: 'Un hechizo que roba la esencia vital del enemigo. Solo los más poderosos conocen su secreto y sobreviven para contarlo.',
    price: 6000, image: 'https://picsum.photos/seed/void13/300/400' },

  { id: 'p014', name: 'Escudo Arcano', type: 'Hechizo', rarity: 'Común',
    stats: { atk: 0, def: 50, hp: 0, mana: 4 },
    abilities: [],
    effects: 'Crea un escudo de 50 puntos que absorbe daño por 2 turnos antes de disiparse.',
    description: 'Una barrera de energía pura que protege del daño físico y mágico. Un básico en cualquier mazo defensivo.',
    price: 250, image: 'https://picsum.photos/seed/shield14/300/400' },

  { id: 'p015', name: 'Tormenta de Arena', type: 'Hechizo', rarity: 'Común',
    stats: { atk: 45, def: 0, hp: 0, mana: 4 },
    abilities: [],
    effects: 'Inflige 45 de daño y reduce la precisión de todos los enemigos en un 30% por 2 turnos.',
    description: 'Convoca los vientos del desierto del Nexus para cegar y dañar a todos los oponentes simultáneamente.',
    price: 280, image: 'https://picsum.photos/seed/sand15/300/400' },

  { id: 'p016', name: 'Meteorito Cósmico', type: 'Hechizo', rarity: 'Legendaria',
    stats: { atk: 200, def: 0, hp: 0, mana: 15 },
    abilities: [],
    effects: 'Inflige 200 de daño puro ignorando toda defensa, resistencia y escudos activos.',
    description: 'El poder de las estrellas cayendo sobre tus enemigos. El hechizo definitivo del arsenal del Nexus.',
    price: 8000, image: 'https://picsum.photos/seed/meteor16/300/400' },

  { id: 'p017', name: 'Maldición Ancestral', type: 'Hechizo', rarity: 'Épica',
    stats: { atk: 0, def: 0, hp: 0, mana: 8 },
    abilities: [],
    effects: 'Maldice al objetivo: reduce todos sus stats en un 15% acumulativo por 5 turnos.',
    description: 'Una maldición milenaria grabada en las ruinas del primer Nexus. Consume poco a poco el poder del enemigo.',
    price: 2100, image: 'https://picsum.photos/seed/curse17/300/400' },

  { id: 'p018', name: 'Resurrección', type: 'Hechizo', rarity: 'Épica',
    stats: { atk: 0, def: 0, hp: 0, mana: 11 },
    abilities: [],
    effects: 'Revive a un aliado caído con el 50% de su HP máximo y listo para actuar en el mismo turno.',
    description: 'La magia de la vida en su forma más pura. Solo los maestros de la luz conocen este hechizo prohibido.',
    price: 3000, image: 'https://picsum.photos/seed/rez18/300/400' },

  // ── ÍTEMS ─────────────────────────────────────────────────────────────────
  { id: 'p019', name: 'Escudo de Escama de Dragón', type: 'Ítem', rarity: 'Legendaria',
    stats: { atk: 0, def: 120, hp: 50, mana: 0 },
    abilities: ['Absorción de Fuego'],
    effects: 'Inmunidad completa al daño de fuego. +120 DEF, +50 HP. Refleja 10% del daño recibido.',
    description: 'Forjado con las escamas del último dragón rojo del Nexus. Un artefacto de valor incalculable que ningún guerrero rechazaría.',
    price: 7000, image: 'https://picsum.photos/seed/dshield19/300/400' },

  { id: 'p020', name: 'Arco Encantado', type: 'Ítem', rarity: 'Épica',
    stats: { atk: 65, def: 0, hp: 0, mana: 0 },
    abilities: ['Flecha Encantada'],
    effects: '+65 ATK. Cada flecha tiene un 20% de infligir un estado negativo aleatorio al objetivo.',
    description: 'Un arco cuya madera fue cortada del Árbol del Mundo mientras aún ardía. Sus flechas siempre encuentran el punto débil.',
    price: 2400, image: 'https://picsum.photos/seed/bow20/300/400' },

  { id: 'p021', name: 'Espada de Acero', type: 'Ítem', rarity: 'Común',
    stats: { atk: 30, def: 5, hp: 0, mana: 0 },
    abilities: [],
    effects: '+30 ATK, +5 DEF. Una espada confiable para cualquier situación de combate.',
    description: 'Una buena espada de acero. Simple pero confiable en el campo de batalla. La preferida de los guerreros novatos.',
    price: 150, image: 'https://picsum.photos/seed/sword21/300/400' },

  { id: 'p022', name: 'Amuleto del Nexus', type: 'Ítem', rarity: 'Rara',
    stats: { atk: 15, def: 15, hp: 30, mana: 3 },
    abilities: ['Resonancia del Nexus'],
    effects: '+15 ATK, +15 DEF, +30 HP, +3 Mana. Resuena con la energía del Nexus amplificando todas las habilidades.',
    description: 'Un amuleto que vibra con la energía primordial del Nexus. Equilibra perfectamente todos los atributos del portador.',
    price: 800, image: 'https://picsum.photos/seed/amulet22/300/400' },

  { id: 'p023', name: 'Bastón del Sabio', type: 'Ítem', rarity: 'Épica',
    stats: { atk: 0, def: 0, hp: 0, mana: 5 },
    abilities: ['Amplificar Magia'],
    effects: '+5 Mana. Todos los hechizos equipados infligen 25% más de daño o efecto.',
    description: 'Un bastón tallado de roble milenario. Amplifica cualquier magia que pase por él hasta el límite de lo posible.',
    price: 2600, image: 'https://picsum.photos/seed/staff23/300/400' },

  { id: 'p024', name: 'Botas de Velocidad', type: 'Ítem', rarity: 'Común',
    stats: { atk: 0, def: 0, hp: 0, mana: 0 },
    abilities: ['Paso Rápido'],
    effects: 'Otorga 2 puntos de velocidad de iniciativa. El portador actúa siempre antes de los enemigos lentos.',
    description: 'Ligeras como el viento del Nexus, estas botas permiten al portador actuar antes que la mayoría de sus rivales.',
    price: 200, image: 'https://picsum.photos/seed/boots24/300/400' },

  { id: 'p025', name: 'Corona del Rey Sombrío', type: 'Ítem', rarity: 'Legendaria',
    stats: { atk: 40, def: 40, hp: 80, mana: 4 },
    abilities: ['Aura Real', 'Terror Sombrío'],
    effects: '+40 ATK, +40 DEF, +80 HP, +4 Mana. 15% de que los ataques enemigos fallen por pánico.',
    description: 'La corona del antiguo rey del Nexus. Quien la porta comanda respeto y miedo a partes iguales. Un símbolo de poder absoluto.',
    price: 9000, image: 'https://picsum.photos/seed/crown25/300/400' },

  { id: 'p026', name: 'Poción de Fuerza', type: 'Ítem', rarity: 'Común',
    stats: { atk: 40, def: 0, hp: 0, mana: 0 },
    abilities: [],
    effects: '+40 ATK temporal por 3 turnos. Consumible de un solo uso por batalla.',
    description: 'Una poción de alquimia básica que potencia la fuerza física temporalmente. Muy popular en mercados del Nexus.',
    price: 120, image: 'https://picsum.photos/seed/potion26/300/400' },

  // ── TRAMPAS ───────────────────────────────────────────────────────────────
  { id: 'p027', name: 'Trampa de Espinas', type: 'Trampa', rarity: 'Común',
    stats: { atk: 35, def: 0, hp: 0, mana: 2 },
    abilities: [],
    effects: 'Se activa automáticamente cuando el enemigo realiza un ataque físico. Inflige 35 de daño de represalia.',
    description: 'Una trampa básica de espinas encantadas. Simple y muy efectiva para contrarrestar jugadores agresivos.',
    price: 180, image: 'https://picsum.photos/seed/trap27/300/400' },

  { id: 'p028', name: 'Trampa de Fuego Arcano', type: 'Trampa', rarity: 'Rara',
    stats: { atk: 75, def: 0, hp: 0, mana: 5 },
    abilities: ['Quemadura Arcana'],
    effects: 'Explota al ser activada, infligiendo 75 de daño de fuego y aplicando quemadura por 2 turnos.',
    description: 'Una runa de fuego oculta que espera al enemigo desprevenido para consumirlo en llamas arcanas irreversibles.',
    price: 850, image: 'https://picsum.photos/seed/firetrap28/300/400' },

  { id: 'p029', name: 'Portal Trampa', type: 'Trampa', rarity: 'Épica',
    stats: { atk: 0, def: 0, hp: 0, mana: 7 },
    abilities: ['Destierro Dimensional'],
    effects: 'Destierra al enemigo que la activa a una dimensión de vacío por 2 turnos completos.',
    description: 'Un portal inestable que absorbe al activador enviándolo a una dimensión de vacío temporal. Estratégicamente devastador.',
    price: 2000, image: 'https://picsum.photos/seed/portal29/300/400' },

  { id: 'p030', name: 'Niebla Confusora', type: 'Trampa', rarity: 'Común',
    stats: { atk: 0, def: 0, hp: 0, mana: 3 },
    abilities: ['Confusión'],
    effects: 'Aplica Confusión al enemigo por 2 turnos: 50% de probabilidad de que sus ataques fallen o se vuelvan contra él.',
    description: 'Una trampa de niebla mágica que desorienta completamente al oponente. Básica en todo mazo de control.',
    price: 220, image: 'https://picsum.photos/seed/fog30/300/400' },

  { id: 'p031', name: 'Sello del Silencio', type: 'Trampa', rarity: 'Rara',
    stats: { atk: 0, def: 0, hp: 0, mana: 6 },
    abilities: ['Silencio Arcano'],
    effects: 'Silencia al enemigo por 3 turnos: incapaz de lanzar hechizos ni activar habilidades mágicas.',
    description: 'Un sello rúnico que suprime la voz mágica del oponente. La pesadilla de cualquier mago del Nexus.',
    price: 900, image: 'https://picsum.photos/seed/seal31/300/400' },

  { id: 'p032', name: 'Trampa del Tiempo Detenido', type: 'Trampa', rarity: 'Legendaria',
    stats: { atk: 0, def: 0, hp: 0, mana: 10 },
    abilities: ['Detener el Tiempo'],
    effects: 'Detiene completamente al enemigo por 3 turnos. Solo puede usarse una vez por batalla. No tiene contrarmedida.',
    description: 'La trampa más poderosa del Nexus. Manipula el flujo temporal mismo. Un turno bien elegido puede decidir cualquier batalla.',
    price: 7500, image: 'https://picsum.photos/seed/time32/300/400' },
];

// ─── Ratings y Comentarios (en memoria) ───────────────────────────────────
// ratings: { [productId]: { [userId]: stars } }
// comments: { [productId]: Comment[] }
const ratings = {};
const comments = {};

// Inicializar estructuras para cada producto
products.forEach(p => {
  ratings[p.id] = {};
  comments[p.id] = [];
});

// Comentarios demo pre-cargados
comments['p001'] = [
  { id: 'c001', userId: 'usr-0002', apodo: 'ShadowHunter', stars: 5,
    text: 'La mejor carta del juego. Su habilidad de ignorar defensa la hace imprescindible.', images: [], date: '2024-11-15T10:30:00Z' },
];
comments['p009'] = [
  { id: 'c002', userId: 'usr-0001', apodo: 'DemoPlayer', stars: 4,
    text: 'Gran daño por el costo de maná. El efecto de quemadura es muy útil.', images: [], date: '2024-11-16T14:20:00Z' },
];
ratings['p001']['usr-0002'] = 5;
ratings['p009']['usr-0001'] = 4;

// ─── Índice de búsqueda ────────────────────────────────────────────────────
// Construye un índice invertido de tokens para búsqueda eficiente con mínimo 4 caracteres.
const searchIndex = new Map();

const buildSearchIndex = () => {
  products.forEach(product => {
    const textToIndex = [
      product.name,
      product.type,
      product.rarity,
      product.description,
      product.effects,
      ...product.abilities,
    ].join(' ').toLowerCase();

    // Tokenizar y generar substrings de longitud >= 4
    const tokens = textToIndex.match(/\w+/g) || [];
    tokens.forEach(token => {
      for (let len = 4; len <= token.length; len++) {
        for (let start = 0; start <= token.length - len; start++) {
          const sub = token.substr(start, len);
          if (!searchIndex.has(sub)) searchIndex.set(sub, new Set());
          searchIndex.get(sub).add(product.id);
        }
      }
    });
  });
  console.log(`✅ Search index built: ${searchIndex.size} tokens indexed`);
};

const searchProducts = (query) => {
  const q = query.toLowerCase().trim();
  if (q.length < 4) return [];
  const matchIds = new Set();
  for (const [token, ids] of searchIndex.entries()) {
    if (token.includes(q) || q.includes(token)) {
      ids.forEach(id => matchIds.add(id));
    }
  }
  return products.filter(p => matchIds.has(p.id));
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const getAvgRating = (productId) => {
  const productRatings = Object.values(ratings[productId] || {});
  if (productRatings.length === 0) return 0;
  return parseFloat((productRatings.reduce((a, b) => a + b, 0) / productRatings.length).toFixed(1));
};

const getProductById = (id) => products.find(p => p.id === id);
const getAllProducts = () => products;

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  buildSearchIndex,
  ratings,
  comments,
  getAvgRating,
};
