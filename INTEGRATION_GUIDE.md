# 🚀 GUÍA DE INTEGRACIÓN - Detalle de Producto

## Paso 1: Preparar el Backend

### 1.1 Endpoint GET /api/v1/products/:id

Tu backend debe retornar un JSON con esta estructura:

```javascript
// Node.js Express ejemplo
app.get('/api/v1/products/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Buscar producto
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Buscar subasta activa
    const auction = await Auction.findActive(id);
    
    // Buscar comentarios
    const comments = await Comment.find({ productId: id }).sort({ createdAt: -1 });
    
    res.json({
      product,
      auction,
      comments
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
```

### 1.2 Endpoint POST /api/v1/auctions/:auctionId/bids

```javascript
app.post('/api/v1/auctions/:auctionId/bids', requireAuth, async (req, res) => {
  const { auctionId } = req.params;
  const { amount } = req.body;
  const userId = req.user.id;
  
  // Validaciones
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  const auction = await Auction.findById(auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  if (auction.endsAt < new Date()) return res.status(410).json({ error: 'Auction ended' });
  
  const minBid = auction.currentBid + 10; // MIN_INCREMENT
  if (amount < minBid) {
    return res.status(400).json({ 
      error: `Minimum bid is ${minBid}`,
      required: minBid 
    });
  }
  
  if (auction.seller.id === userId) {
    return res.status(403).json({ error: 'Cannot bid on own auction' });
  }
  
  // Registrar puja
  const bid = new Bid({ auctionId, userId, amount, createdAt: new Date() });
  await bid.save();
  
  auction.currentBid = amount;
  auction.bidCount += 1;
  auction.lastBidder = userId;
  await auction.save();
  
  res.status(201).json({
    success: true,
    currentBid: auction.currentBid,
    bidCount: auction.bidCount,
    nextMinBid: auction.currentBid + 10
  });
});
```

### 1.3 Endpoint POST /api/v1/auctions/:auctionId/buy-now

```javascript
app.post('/api/v1/auctions/:auctionId/buy-now', requireAuth, async (req, res) => {
  const { auctionId } = req.params;
  const userId = req.user.id;
  
  const auction = await Auction.findById(auctionId);
  if (!auction) return res.status(404).json({ error: 'Auction not found' });
  if (auction.sold) return res.status(410).json({ error: 'Already sold' });
  if (!auction.buyNowPrice) return res.status(400).json({ error: 'Buy now not available' });
  
  // Verificar fondos
  const user = await User.findById(userId);
  if (user.credits < auction.buyNowPrice) {
    return res.status(402).json({ error: 'Insufficient funds' });
  }
  
  // Procesar compra
  auction.sold = true;
  auction.buyer = userId;
  auction.soldAt = new Date();
  await auction.save();
  
  // Transferir créditos
  user.credits -= auction.buyNowPrice;
  await user.save();
  
  // Agregar a inventario
  const inventory = new InventoryItem({
    userId,
    productId: auction.product.id,
    acquiredAt: new Date()
  });
  await inventory.save();
  
  res.json({ success: true, message: 'Purchase successful' });
});
```

---

## Paso 2: Configurar HTML

### 2.1 Ubicar el archivo

```
inventario_glbl/
├── detalle_product.html  ← Este archivo
├── README.md
└── API_EXAMPLES.json
```

### 2.2 Servir el archivo

**Apache/Nginx:**
```nginx
location ~/products/([^/]+)$ {
  try_files /detalle_product.html =404;
}
```

**Node.js/Express:**
```javascript
app.get('/products/:id', (req, res) => {
  res.sendFile(__dirname + '/detalle_product.html');
});
```

---

## Paso 3: Configurar Base URL

Edita la línea en el JavaScript (aprox. línea 1050):

```javascript
const CONFIG = {
  BASE_URL: 'https://tu-api.com/api/v1',  // ← Cambiar a tu URL
  MIN_INCREMENT: 10,
  COUNTDOWN_INTERVAL: 1000,
};
```

---

## Paso 4: Eliminar Datos Mock

**CRÍTICO ANTES DE PRODUCCIÓN:**

Busca y elimina este bloque al final del archivo:

```html
<!-- ELIMINAR EN PRODUCCIÓN -->
<script>
(function _mockData() {
  // ... código mock complete
})();
</script>
```

---

## Paso 5: Testing

### 5.1 Test Local

1. Abre en navegador: `http://localhost:3000/products/test-id`
2. Abre consola (F12)
3. Verifica en tab Network que se haga fetch a `/api/v1/products/test-id`

### 5.2 Respuestas Esperadas

**Éxito (200):**
```json
{
  "product": { ... },
  "auction": { ... },
  "comments": [ ... ]
}
```

**No encontrado (404):**
```json
{ "error": "Product not found" }
```

### 5.3 Validar Acciones

```javascript
// En consola del navegador:
ProductDetail.init()              // Fuerza recarga
ProductDetail.handleBid()         // Simula puja
ProductDetail.handleBuyNow()      // Simula compra
ProductDetail.handleWatch()       // Simula seguimiento
```

---

## Paso 6: CORS Configuration

### Si tu API está en dominio diferente:

```javascript
// Backend CORS headers
res.header('Access-Control-Allow-Origin', 'https://tu-dominio.com');
res.header('Access-Control-Allow-Credentials', 'true');
res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
res.header('Access-Control-Allow-Headers', 'Content-Type');
```

---

## Paso 7: Seguridad

### 7.1 Validar Datos en Frontend

```javascript
// Ya está incluido en el código:
- Escape de HTML con _esc()
- Validación de números en pujas
- Manejo de imágenes rotas
- Límite de items mostrados
```

### 7.2 Validar en Backend

```javascript
// SIEMPRE validar:
- Autenticación (requireAuth middleware)
- Autorización (usuario propietario)
- Rangos de datos (amount > 0, stats 0-100)
- Rate limiting en pujas
```

---

## Paso 8: Customización de Estilos

### Cambiar Paleta de Colores

Edita las variables CSS (línea ~40):

```css
:root {
  --gold-bright: #ffd700;        /* Amarillo */
  --purple-bright: #da70d6;      /* Púrpura */
  --teal-bright: #00d9ff;        /* Cian */
  /* ... más */
}
```

### Agregar Fuentes Personalizadas

```html
<link href="https://fonts.googleapis.com/css2?family=YOUR_FONT:wght@400;700&display=swap" rel="stylesheet"/>
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| **CORS error** | Configura headers de CORS en backend |
| **Producto no carga** | Verifica que endpoint devuelva JSON correcto |
| **Pujas no funcionan** | Valida `auctionId` en respuesta GET y autenticación |
| **Comentarios sin imágenes** | Asegúrate URLs públicas &nbsp;&nbsp;&nbsp; |
| **Timer no actualiza** | Valida `endsAt` sea ISO 8601: `2025-11-20T14:30:00Z` |
| **Estilos rotos** | Verifica que Google Fonts esté cargando |
| **Error 404 incorrecto** | Valida que endpoint devuelva `status: 404` |

---

## 📱 Mobile Optimization

El componente es **100% responsivo**. Para optimizar en mobile:

```html
<!-- Comprimir imágenes de productos -->
<img src="image.jpg?w=600&q=80" />  <!-- Desktop -->
<img src="image.jpg?w=300&q=60" />  <!-- Mobile -->

<!-- Lazy loading ya incluido -->
```

---

## 🔔 Webhooks Recomendados

Si quieres notificaciones en tiempo real, implementa:

```javascript
// Cuando hay puja nueva
POST /webhooks/bid-placed
{ auctionId, userId, amount, timestamp }

// Cuando se vence subasta
POST /webhooks/auction-ended
{ auctionId, winnerId, finalBid }

// Cuando se compra inmediato
POST /webhooks/item-sold
{ auctionId, buyerId, price }
```

---

## 📊 Métricas Recomendadas

Trackea en Google Analytics:

```javascript
// Evento: visualización de producto
gtag('event', 'view_product', {
  product_id: productId,
  product_name: productName,
  value: currentBid
});

// Evento: puja realizada
gtag('event', 'bid_placed', {
  auction_id: auctionId,
  bid_amount: amount
});

// Evento: compra inmediata
gtag('event', 'buy_now', {
  auction_id: auctionId,
  purchase_price: buyNowPrice
});
```

---

## ✅ Checklist Final

- [ ] Backend implementa los 3 endpoints (GET products, POST bid, POST buy-now)
- [ ] BASE_URL configurada correctamente
- [ ] Datos mock eliminados
- [ ] CORS configurado
- [ ] Imágenes hostadas en CDN público
- [ ] HTTPS en producción
- [ ] Rate limiting en pujas
- [ ] Testing en mobile realizado
- [ ] Analytics configurado
- [ ] Documentación actualizada

---

## 🆘 Soporte

**Errores comunes:**

1. **"Cannot GET /products/123"** → Configura routing en tu servidor
2. **"CORS error"** → Revisa headers Access-Control-Allow-*
3. **"fetch calls 404"** → Verifica BASE_URL y estructura de endpoint
4. **"Imágenes no carga"** → Usa URLs HTTPS públicas

---

**Última actualización:** Noviembre 2025

