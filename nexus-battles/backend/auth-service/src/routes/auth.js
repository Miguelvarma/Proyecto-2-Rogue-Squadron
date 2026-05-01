const router = require('express').Router();
const jwt = require('jsonwebtoken');
const {
  findByEmail, findById, createUser,
  comparePassword, sanitizeUser,
  isApodoValid, validatePassword,
} = require('../db/users');
const { authMiddleware, JWT_SECRET } = require('../middleware/authMiddleware');

const TOKEN_EXPIRY = '24h';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, apodo: user.apodo, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );

// ─── POST /api/auth/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { nombres, apellidos, email, password, apodo, avatar } = req.body;

    // Campos requeridos
    if (!nombres || !apellidos || !email || !password || !apodo) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Validar formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Validar contraseña
    const pwdError = validatePassword(password);
    if (pwdError) return res.status(400).json({ error: pwdError });

    // Validar apodo
    if (apodo.length < 3 || apodo.length > 20) {
      return res.status(400).json({ error: 'El apodo debe tener entre 3 y 20 caracteres' });
    }
    if (!isApodoValid(apodo)) {
      return res.status(400).json({ error: 'El apodo contiene palabras no permitidas' });
    }

    // Email único
    if (findByEmail(email)) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });
    }

    const newUser = await createUser({ nombres, apellidos, email, password, apodo, avatar });
    const token = signToken(newUser);

    res.status(201).json({
      message: 'Cuenta creada exitosamente',
      token,
      user: sanitizeUser(newUser),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    const user = findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = signToken(user);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  const user = findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  res.json({ user: sanitizeUser(user) });
});

module.exports = router;
