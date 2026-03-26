# Detalle de Producto — Nexus Battle

## 📋 Descripción

Página de detalle de producto para el sistema de subastas de **Nexus Battle**. Muestra información completa de artículos de juego incluyendo estadísticas, habilidades, efectos, sistema de pujas y comentarios de jugadores.

---

## ✅ Características Implementadas

### 🎯 Histeria de Usuario
**Como jugador, quiero ver todos los detalles de un producto específico para decidir si es útil para mi estrategia de juego.**

### 📊 Información del Producto
- ✅ Nombre, imagen y descripción del producto
- ✅ Tipo de producto y nivel de rareza (Común, Poco común, Rara, Épica, Legendaria)
- ✅ Estadísticas de combate (HP, Ataque, Defensa, Velocidad, Maná, etc.)
- ✅ Habilidades especiales con descripción y coste de maná
- ✅ Efectos y sinergias (buff, debuff, pasivos)
- ✅ Calificación promedio con estrellas (0-5, soporta medias)
- ✅ Datos del vendedor (nombre, calificación)

### 💰 Sistema de Subastas
- ✅ Puja mínima actual y precio de compra inmediata
- ✅ Temporizador de subasta con cuenta regresiva
- ✅ Número de pujas registradas
- ✅ Validación de incremento mínimo
- ✅ Campo de entrada de ofertas con feedback en tiempo real
- ✅ Botón de compra inmediata (deshabilitado si no hay precio)
- ✅ Lista de seguimiento / Watchlist

### 💬 Comentarios y Reseñas
- ✅ Listado de comentarios con apodo del jugador
- ✅ Calificación individual (estrellas) para cada comentario
- ✅ Texto del comentario con escape de HTML
- ✅ Soporte para imágenes adjuntas (lazy loading)
- ✅ Avatar del comentarista
- ✅ Fecha de publicación formateada
- ✅ Animación gradual de carga de comentarios

### 🎨 Interfaz de Usuario
- ✅ Diseño responsivo (mobile, tablet, desktop)
- ✅ Paleta de colores gaming (oro, púrpura, teal)
- ✅ Tipografía temática (Cinzel + Rajdhani)
- ✅ Animaciones suaves (fade-up, pulse, shimmer)
- ✅ Navegación por breadcrumbs
- ✅ Estados de carga, error y contenido

### ❌ Manejo de Errores
- ✅ HTTP 404: "Producto no encontrado"
- ✅ Errores de servidor con opción de reintentar
- ✅ Validación de entrada en campo de puja
- ✅ Feedback visual en tiempo real
- ✅ Manejo de imágenes rotas en comentarios

---

## 🚀 API Endpoints

### Obtener Detalles del Producto
```
GET /api/v1/products/:id
```

**Response Success (200):**
```json
{
  "product": {
    "id": "hero-001",
    "name": "Kael'thara",
    "imageUrl": "https://...",
    "type": "Héroe",
    "rarity": "epic",
    "description": "Antigua guerrera...",
    "avgRating": 4.5,
    "reviewCount": 128,
    "skills": [
      {
        "name": "Golpe Sombrío",
        "description": "Inflige 320% del daño...",
        "manaCost": 40
      }
    ],
    "effects": [
      {
        "name": "Vampirismo",
        "type": "buff"
      }
    ],
    "stats": {
      "HP": 98,
      "Attack": 87,
      "Defense": 74,
      "Speed": 65,
      "Mana": 80
    }
  },
  "auction": {
    "id": "auc-4821",
    "currentBid": 1850,
    "minBid": 1500,
    "buyNowPrice": 3200,
    "bidCount": 17,
    "endsAt": "2025-11-20T14:30:00Z",
    "seller": {
      "nickname": "ShadowMaster_X",
      "rating": 4.8
    }
  },
  "comments": [
    {
      "nickname": "DragonSlayer99",
      "rating": 5,
      "text": "Absolutamente devastadora...",
      "images": ["https://..."],
      "avatarUrl": "https://...",
      "createdAt": "2025-11-14T10:23:00Z"
    }
  ]
}
```

**Response Error (404):**
```json
{
  "error": "Product not found",
  "status": 404
}
```

---

### Realizar una Puja
```
POST /api/v1/auctions/:auctionId/bids
Content-Type: application/json

{
  "amount": 2000
}
```

**Response (201):**
```json
{
  "success": true,
  "currentBid": 2000,
  "bidCount": 18
}
```

**Errors:**
- `401 Unauthorized`: Usuario no autenticado
- `403 Forbidden`: No puedes pujar en tus propios productos
- `409 Conflict`: Ya hay una puja más alta
- `400 Bad Request`: Oferta inválida

---

### Compra Inmediata
```
POST /api/v1/auctions/:auctionId/buy-now
```

**Errors:**
- `401 Unauthorized`: Usuario no autenticado
- `402 Payment Required`: Fondos insuficientes
- `404 Not Found`: Subasta no existe
- `410 Gone`: Ya fue comprado

---

### Lista de Seguimiento
```
POST /api/v1/auctions/:auctionId/watch
DELETE /api/v1/auctions/:auctionId/watch
```

---

## 🔧 Configuración

Edita la sección `CONFIG` en el código JavaScript:

```javascript
const CONFIG = {
  BASE_URL: '/api/v1',           // URL base de la API
  MIN_INCREMENT: 10,              // Incremento mínimo entre pujas
  COUNTDOWN_INTERVAL: 1000,      // ms entre actualizaciones del timer
};
```

---

## 📱 Compatibilidad

- ✅ Chrome/Edge (últimas versiones)
- ✅ Firefox (últimas versiones)
- ✅ Safari 12+
- ✅ Dispositivos móviles iOS/Android
- ✅ Navegadores accesibles (WCAG 2.1 AA)

---

## 🎨 Personalización de Colores

Modifica las variables CSS en `:root`:

```css
:root {
  --gold-bright: #f0c060;
  --purple-bright: #a78bfa;
  --teal-bright: #4dd9ac;
  /* ... más colores */
}
```

---

## 📦 Dependencias

**Externas:**
- Google Fonts: Cinzel, Rajdhani
- Fetch API (navegadores modernos)

**Nativas:**
- SVG para iconos de estrellas
- CSS Grid & Flexbox
- ES6+ JavaScript

---

## 🧪 Testing

### Datos Mock
El archivo incluye datos mock para desarrollo. **Elimina el bloque `<script>` de mock antes de producción**:

```html
<!-- ELIMINAR EN PRODUCCIÓN -->
<script>
(function _mockData() {
  // ... código mock
})();
</script>
```

---

## ⚙️ URLs Soportadas

El componente detecta automáticamente el ID del producto de múltiples formatos:

```
/products/hero-001
/catalog/products/hero-001
/products?id=hero-001
```

---

## 🔐 Seguridad

- ✅ Escape de contenido HTML (previene XSS)
- ✅ Validación de entrada en pujas
- ✅ Headers de Content-Type validados
- ✅ Credenciales incluidas en requests (CORS)

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Producto no carga | Verifica que el endpoint devuelva datos correctos |
| Comentarios sin imágenes | Asegúrate de que las URLs sean públicas sin CORS |
| Timer no actualiza | Verifica que `endsAt` sea un ISO 8601 válido |
| Pujas no funcionan | Valida que `auctionId` sea correcto y el usuario esté autenticado |

---

## 📝 Notas de Desarrollo

- Usa `ProductDetail.init()` para forzar una recarga
- El módulo usa patrón IIFE para evitar contaminación global
- Los métodos públicos: `init()`, `handleBid()`, `handleBuyNow()`, `handleWatch()`
- El estado interno está protegido (`_state`)

---

## 📄 Licencia

© 2025 Nexus Battle. Todos los derechos reservados.

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0 Completa

