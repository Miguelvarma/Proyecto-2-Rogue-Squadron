const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegisterInput, isOffensive, containsCelebrityOrBrand } = require('../utils/validators');

async function register(req, res) {
  try {
    const { nombres, apellidos, email, password, apodo, avatar } = req.body || {};

    const { valid, errors } = validateRegisterInput({ nombres, apellidos, email, password, apodo });
    if (!valid) return res.status(400).json({ errors });

    // Unicidad
    if (User.findByEmail(email)) return res.status(409).json({ message: 'Email ya existe' });
    if (User.findByApodo(apodo)) return res.status(409).json({ message: 'Apodo ya existe' });

    // Apodo blacklist
    if (isOffensive(apodo)) return res.status(400).json({ message: 'Apodo contiene palabras ofensivas' });
    if (containsCelebrityOrBrand(apodo)) return res.status(400).json({ message: 'Apodo contiene nombres no permitidos' });

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
    const hashed = await bcrypt.hash(password, saltRounds);

    const created = await User.createUser({ nombres, apellidos, email, password: hashed, apodo, avatar });

    // Generar token JWT
    const token = jwt.sign(
      { id: created.id, email: created.email, role: created.rol },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Simular envío de email
    console.log(`Simulated confirmation email to ${created.email}`);

    const { password: _p, ...userSafe } = created;

    return res.status(201).json({ user: userSafe, token });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Error interno' });
  }
}

module.exports = { register };
