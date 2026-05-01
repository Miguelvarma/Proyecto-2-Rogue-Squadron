const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const { seedUsers } = require('./db/users');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'auth-service', port: PORT }));

app.listen(PORT, async () => {
  await seedUsers();
  console.log(`🔐 Auth Service corriendo en http://localhost:${PORT}`);
});
