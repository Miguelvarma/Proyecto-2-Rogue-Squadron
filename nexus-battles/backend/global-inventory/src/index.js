const express = require('express');
const cors = require('cors');
const productsRoutes = require('./routes/products');
const { buildSearchIndex } = require('./db/products');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

app.use('/api/v1/products', productsRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok', service: 'global-inventory', port: PORT }));

app.listen(PORT, () => {
  buildSearchIndex();
  console.log(`📦 Global Inventory Service corriendo en http://localhost:${PORT}`);
});
