const express = require('express');

const app = express();

app.use(express.json());

// Rutas de autenticación
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: 'auth-service' });
});

const port = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Auth service ejecutándose en puerto ${port}`);
  });
}

module.exports = app;
