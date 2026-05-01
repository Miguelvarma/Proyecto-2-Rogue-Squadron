const bcrypt = require('bcryptjs');

// ─── In-memory Users Store ─────────────────────────────────────────────────
// Simula la base de datos hasta que el módulo de usuarios del equipo esté listo.
// Al reiniciar el servidor los datos se pierden (comportamiento esperado en modo simulado).

const users = [];
let nextId = 1;

// Usuarios demo pre-cargados (se inicializan al arrancar el servicio)
const seedUsers = async () => {
  const demos = [
    { nombres: 'Demo', apellidos: 'Player', email: 'demo@nexus.com', password: 'Demo@12345', apodo: 'DemoPlayer', avatar: 'warrior' },
    { nombres: 'Shadow', apellidos: 'Hunter', email: 'shadow@nexus.com', password: 'Shadow@99!', apodo: 'ShadowHunter', avatar: 'mage' },
  ];
  for (const d of demos) {
    await createUser(d);
  }
  console.log('✅ Demo users seeded');
};

// ─── Palabras bloqueadas para apodos ──────────────────────────────────────
const BLOCKED_WORDS = [
  'admin', 'nexus', 'master', 'god', 'trump', 'biden', 'obama',
  'putin', 'hitler', 'nazi', 'fuck', 'shit', 'cock', 'bitch',
  'puta', 'mierda', 'coño', 'culo', 'pendejo', 'cabron',
];

const isApodoValid = (apodo) => {
  const lower = apodo.toLowerCase();
  return !BLOCKED_WORDS.some(word => lower.includes(word));
};

// ─── Validación de contraseña ──────────────────────────────────────────────
const validatePassword = (password) => {
  if (password.length < 8)         return 'Mínimo 8 caracteres';
  if (!/[A-Z]/.test(password))     return 'Debe incluir al menos una mayúscula';
  if (!/[a-z]/.test(password))     return 'Debe incluir al menos una minúscula';
  if (!/[0-9]/.test(password))     return 'Debe incluir al menos un número';
  if (!/[!@#$%^&*\-_+=?]/.test(password)) return 'Debe incluir al menos un símbolo (!@#$%^&*-_+=?)';
  return null;
};

// ─── CRUD de usuarios ──────────────────────────────────────────────────────
const findByEmail = (email) =>
  users.find(u => u.email === email.toLowerCase().trim());

const findById = (id) => users.find(u => u.id === id);

const createUser = async ({ nombres, apellidos, email, password, apodo, avatar }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: `usr-${String(nextId++).padStart(4, '0')}`,
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    apodo: apodo.trim(),
    avatar: avatar || 'default',
    createdAt: new Date().toISOString(),
    stats: { wins: 0, losses: 0, level: 1, credits: 1000 },
  };
  users.push(user);
  return user;
};

const comparePassword = (plain, hashed) => bcrypt.compare(plain, hashed);

const sanitizeUser = (user) => {
  const { password, ...safe } = user;
  return safe;
};

module.exports = {
  seedUsers,
  findByEmail,
  findById,
  createUser,
  comparePassword,
  sanitizeUser,
  isApodoValid,
  validatePassword,
};
