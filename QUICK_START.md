# ⚡ QUICK START — 5 Minutos

## 🎯 Objetivo
Tener funcional la página de detalle de producto en 5 minutos.

---

## 1️⃣ Paso 1: Copiar el HTML (30 segundos)

```bash
# Tu estructura debe ser:
tu-proyecto/
├── pages/
│   └── detalle_product.html    ← Copiar aquí
└── package.json
```

---

## 2️⃣ Paso 2: Configurar BASE_URL (1 minuto)

Abre `detalle_product.html` y busca `const CONFIG`:

```javascript
// Línea ~1050
const CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',  // ← Cambiar a tu URL
  MIN_INCREMENT: 10,
  COUNTDOWN_INTERVAL: 1000,
};
```

---

## 3️⃣ Paso 3: Test Local (2 minutos)

### Con Python:
```bash
python -m http.server 8000
# Abre: http://localhost:8000/pages/detalle_product.html?id=hero-001
```

### Con Node.js:
```bash
npx http-server
# Abre: http://localhost:8080/pages/detalle_product.html?id=hero-001
```

### Con Live Server (VS Code):
```bash
# Click derecho en archivo → Open with Live Server
```

---

## 4️⃣ Paso 4: Verificar API Mock (1 minuto)

Abre **Devtools (F12)** y deberías ver:
- Tab **Network**: GET a `/api/v1/products/hero-001` 
- Status: **200 OK**
- Response: JSON con producto, subasta, comentarios

Si ves esto ✅ significa que el mock está funcionando.

---

## 5️⃣ Paso 5: Conectar tu Backend (1 minuto)

### Elimina el Mock:

Busca al final del archivo y elimina esto:

```html
<!-- ELIMINAR EN PRODUCCIÓN -->
<script>
(function _mockData() {
  // ... TODO el bloque
})();
</script>
```

### Backend URL:

Reemplaza en `CONFIG.BASE_URL` tu URL de verdad:

```javascript
const CONFIG = {
  BASE_URL: 'https://mi-api.com/api/v1',
  // ...
};
```

---

## ✅ Listo!

Tu página de detalle está **100% funcional** y lista para conectarse a tu backend.

---

## 🔗 URLs Soportadas

El componente auto-detecta el ID del producto de cualquiera de estos formatos:

```
/products/hero-001
/products?id=hero-001
/catalog/products/hero-001
```

---

## 🧪 Pruebas Rápidas

### En Consola (F12):
```javascript
// Ver estado
console.log(ProductDetail);  

// Forzar recarga
ProductDetail.init();

// Simular puja
document.getElementById('bidAmount').value = 2000;
ProductDetail.handleBid();
```

---

## 🐛 Troubleshooting

| Error | Solución |
|-------|----------|
| "Cannot GET /products/123" | Configura el routing en servidor |
| CORS error | Agrega headers CORS en backend |
| "Undefined BASE_URL" | Edita CONFIG con URL correcta |
| Datos mock aparecen | Elimina el último `<script>` del archivo |

---

## 📱 Ver en Mobile

### Opción 1: Tunnel Ngrok
```bash
ngrok http 8000
# Abre URL generada en mobile
```

### Opción 2: Mismo WiFi
```bash
# Desktop: ifconfig | grep inet
# Mobile: http://192.168.x.x:8000

tu-maquina$ ipconfig (Windows)
# Busca IPv4 Address
```

---

## 🎨 Personalización Rápida

### Cambiar Color Primario

```css
/* Busca :root al inicio del <style> */
:root {
  --gold-bright: #FFD700;   ← Cambiar aquí
  /* ... resto */
}
```

### Cambiar Texto

```html
<!-- Busca .error-title -->
<h1 class="error-title">Tu Mensaje Aquí</h1>
```

---

## 📊 Estructura de Respuesta Esperada

Tu API debe devolver:

```javascript
GET /api/v1/products/:id → 200 OK
{
  "product": {
    "name": "Nombre",
    "imageUrl": "https://...",
    "stats": { "HP": 100, "Attack": 80 },
    // ... más campos
  },
  "auction": {
    "currentBid": 1000,
    "endsAt": "2025-11-20T14:30:00Z",
    // ... más campos
  },
  "comments": [ /* array */ ]
}
```

---

## 🚀 Deploy a Producción

### 1. Elimina Mock
```bash
# Busca y elimina el último <script>
```

### 2. Minimiza
```bash
npx terser detalle_product.html -c -m
```

### 3. Comprime
```bash
gzip -9 detalle_product.html
```

### 4. Sube a CDN
```bash
# Ejemplo con AWS S3
aws s3 cp detalle_product.html s3://bucket/pages/
```

---

## 💡 Tips

✅ Usa DevTools Network para debuging  
✅ Check console.log en funciones  
✅ Test en incógnito para CORS issues  
✅ Verifica timestamp en comentarios  
✅ Valida que auctionId sea correcto  

---

## 🆘 ¿Necesitas Ayuda?

1. **Revisa INTEGRATION_GUIDE.md** — guía completa
2. **Mira API_EXAMPLES.json** — ejemplos de payloads
3. **Lee README.md** — referencia técnica
4. **Verifica archivos** — están en la misma carpeta

---

**¡Listo para ir! 🚀**

*Tiempo total: ~5 minutos*

