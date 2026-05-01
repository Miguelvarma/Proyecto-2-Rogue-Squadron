const express = require('express');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/v1/inventory', inventoryRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'personal-inventory', port: PORT }));

app.listen(PORT, () => {
  console.log(`🎒 Personal Inventory Service corriendo en http://localhost:${PORT}`);
});
