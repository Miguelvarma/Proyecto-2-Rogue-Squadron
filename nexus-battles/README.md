# ⚔ Nexus Battles IV — Módulos de Inventario

Proyecto de microservicios para los módulos de **Inventario Global** e **Inventario Personal**.

## Arquitectura

| Servicio             | Puerto | Descripción                                  |
|----------------------|--------|----------------------------------------------|
| Auth Service         | 3001   | Registro, login y validación de JWT          |
| Global Inventory     | 3002   | Catálogo maestro de cartas y objetos         |
| Personal Inventory   | 3003   | Inventario y mazos de cada jugador           |
| Frontend (React/Vite)| 5173   | Interfaz web                                 |

---

## 🚀 Instalación y ejecución

Necesitas **4 terminales** abiertas en VS Code (o usa el split terminal).

### Terminal 1 — Auth Service
```bash
cd nexus-battles/backend/auth-service
npm install
npm run dev
```

### Terminal 2 — Global Inventory
```bash
cd nexus-battles/backend/global-inventory
npm install
npm run dev
```

### Terminal 3 — Personal Inventory
```bash
cd nexus-battles/backend/personal-inventory
npm install
npm run dev
```

### Terminal 4 — Frontend React
```bash
cd nexus-battles/frontend
npm install
npm run dev
```

Abre el navegador en: **http://localhost:5173**

---

## 👤 Cuentas demo pre-cargadas

| Email                  | Contraseña   | Apodo        |
|------------------------|--------------|--------------|
| demo@nexus.com         | Demo@12345   | DemoPlayer   |
| shadow@nexus.com       | Shadow@99!   | ShadowHunter |

---

## 📋 Endpoints disponibles

### Auth Service (`:3001`)
| Método | Ruta               | Auth | Descripción          |
|--------|--------------------|------|----------------------|
| POST   | /api/auth/register | ❌   | Registro de usuario  |
| POST   | /api/auth/login    | ❌   | Login → JWT          |
| GET    | /api/auth/me       | ✅   | Info del usuario     |

### Global Inventory (`:3002`)
| Método | Ruta                                    | Auth | Descripción                      |
|--------|-----------------------------------------|------|----------------------------------|
| GET    | /api/v1/products                        | ❌   | Listar (paginación, búsqueda)    |
| GET    | /api/v1/products/:id                    | ❌   | Detalle + ratings + comentarios  |
| POST   | /api/v1/products/:id/ratings            | ✅   | Calificar (1 vez por usuario)    |
| POST   | /api/v1/products/:id/comments           | ✅   | Agregar comentario               |
| DELETE | /api/v1/products/:id/comments/:cid      | ✅   | Eliminar propio comentario       |

### Personal Inventory (`:3003`)
| Método | Ruta                          | Auth | Descripción                     |
|--------|-------------------------------|------|---------------------------------|
| GET    | /api/v1/inventory             | ✅   | Mis ítems (paginación + filtros)|
| GET    | /api/v1/inventory/decks       | ✅   | Mis mazos                       |
| POST   | /api/v1/inventory/decks       | ✅   | Crear mazo (30 cartas exactas)  |
| PUT    | /api/v1/inventory/decks/:id   | ✅   | Editar mazo                     |
| DELETE | /api/v1/inventory/decks/:id   | ✅   | Eliminar mazo                   |

---

## 🃏 Datos simulados

- **32 productos** en el catálogo global (2 páginas de 16)
- Tipos: Héroe · Hechizo · Ítem · Trampa
- Rarezas: Común · Rara · Épica · Legendaria
- Cada jugador nuevo recibe **12 cartas de inicio** automáticamente
- Los datos viven **en memoria** — se reinician al reiniciar el servidor

---

## ✅ Historias de usuario cubiertas

| Historia                   | Estado | Criterios implementados                                          |
|----------------------------|--------|------------------------------------------------------------------|
| Ver Mi Inventario Personal | ✅     | 16/pág, paginación (10 páginas + flechas), filtros, hover        |
| Ver Detalle de Producto    | ✅     | Stats, habilidades, efectos, rating ★, comentarios, HTTP 404     |
| Crear Mazo                 | ✅     | Exactamente 30 cartas, validación de pertenencia al inventario   |

---

## 🔒 Reglas de negocio implementadas

- Contraseña: 8+ chars · Mayúscula · Minúscula · Número · Símbolo
- Apodo: sin palabras ofensivas ni marcas registradas
- Rating: **1 voto por usuario por producto** (no modificable)
- Comentarios: se pueden agregar y eliminar libremente (solo los propios)
- Búsqueda: activa con **mínimo 4 caracteres** mediante índice invertido
- Mazo: exactamente **30 cartas**, todas deben estar en el inventario del jugador

---

## 🔗 Integración futura con el módulo de Usuarios

Cuando el equipo de Usuarios entregue su microservicio:

1. Eliminar el `auth-service` de esta carpeta
2. Actualizar la constante `AUTH_URL` en `frontend/src/services/api.js`
3. Actualizar la variable `JWT_SECRET` en los archivos `authMiddleware.js` de los dos servicios de inventario para que coincida con el secret del módulo de usuarios

---

## 📁 Estructura del proyecto

```
nexus-battles/
├── backend/
│   ├── auth-service/          ← Servicio temporal de autenticación
│   ├── global-inventory/      ← Catálogo global (puerto 3002)
│   └── personal-inventory/    ← Inventario del jugador (puerto 3003)
└── frontend/                  ← React + Vite (puerto 5173)
```
