# The Nexus Battles V — Proyecto Unificado

Merge de 4 ramas bajo Arquitectura Hexagonal (Puertos y Adaptadores).

## Ramas integradas
| Rama | Funcionalidades |
|------|----------------|
| branch 1 (main) | Auth, Players, Auctions, Missions (base), Payments, Cart, Products, Chatbot (Python) |
| branch 2 | Frontend de Misiones con IA (MisionesPage, MissionCard, useMissions) |
| branch 3 | Dependencias adicionales (package.json) |
| branch 4 | Inventario de Ítems (Items, CRUD, búsqueda, paginación) + Calificaciones (Rating) + Auth extendido (User/apodo) |

## Puertos expuestos
- **Backend (Node/TS):** `http://localhost:3001`
- **Frontend (React/Vite):** `http://localhost:5173`
- **Chatbot (Python/Flask):** `http://localhost:8000`

## Inicio rápido

### Backend
```bash
cd backend
cp .env.example .env
# Rellenar .env con tus credenciales
npm install
mysql -u root -p < scripts/init-db.sql
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Endpoints disponibles

### API v1 (núcleo — branch 1)
- `POST /api/v1/auth/login` | `/register`
- `GET /api/v1/players` | `/auctions` | `/missions`
- `POST /api/v1/payments/order`
- `GET /api/v1/products` | `POST /api/v1/cart`

### API v1 Inventario (branch 4)
- `GET  /api/v1/inventory?tipo=&rareza=&page=`
- `GET  /api/v1/inventory/search?q=`
- `GET  /api/v1/inventory/:id`
- `DELETE /api/v1/inventory/:id` [auth]

### API v1 Calificaciones (branch 4)
- `GET  /api/v1/products/:id/rating`
- `POST /api/v1/products/:id/rate` [auth]

### API v2 Auth extendido (branch 4)
- `POST /api/v2/auth/register` (nombres, apellidos, apodo)
- `POST /api/v2/auth/login`

## Estructura Hexagonal
```
backend/src/
  domain/          # Entidades puras, repositorios (puertos), servicios
  application/     # Casos de uso, puertos de salida, validadores
  infrastructure/  # Adaptadores: DB, HTTP, seguridad, gateways
  config/          # Variables de entorno validadas con Zod
  payments/        # Módulo de pagos (domain segregado)
```
