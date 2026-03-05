# Nexus Battles V — Frontend

React 18 + Vite + TypeScript.

## Estructura

```
src/
├── api/                  ← ÚNICA capa de comunicación con el backend
│   ├── client.ts         ← Instancia axios + interceptors (refresh token)
│   ├── auth.ts           ← authApi: login, register, logout, refresh
│   ├── auctions.ts       ← auctionsApi: getAll, getById, placeBid
│   ├── missions.ts       ← missionsApi: getActive, generate, complete
│   └── players.ts        ← playersApi: getMe, getRankings, getMyInventory
│
├── components/           ← Componentes reutilizables
│   ├── ui/               ← Button, Input, Badge, Modal, Tooltip, Notification
│   ├── layout/           ← Navbar, Sidebar, PageLayout
│   ├── auction/          ← AuctionCard, BidForm, AuctionTimer
│   ├── mission/          ← MissionCard, ObjectiveList, MissionProgress
│   ├── inventory/        ← ItemSlot, ItemTooltip, InventoryGrid
│   └── auth/             ← LoginForm, RegisterForm
│
├── hooks/                ← Custom hooks (useAuctions, useActiveMissions, etc.)
├── pages/                ← Una página por ruta
├── store/                ← Zustand stores (authStore, etc.)
├── types/                ← Tipos TypeScript espejo del backend
├── styles/               ← globals.css con CSS variables (design tokens)
└── utils/                ← Helpers: formatGold, formatDate, rarityColor, etc.
```

## Reglas del equipo frontend

1. **NUNCA conectar directamente a la DB** — Todo va por `src/api/`
2. **NUNCA calcular lógica de negocio** — Precios, validaciones, reglas de juego las decide el backend
3. **Solo usar CSS variables** definidas en `globals.css` para colores y tipografía
4. **Todos los componentes en TypeScript** — Usar los tipos de `src/types/`

## Comandos

```bash
npm run dev      # Desarrollo en http://localhost:5173
npm run build    # Build de producción
npm run preview  # Preview del build
```

## Variables de entorno

```bash
cp .env.example .env
```

## Referencia de diseño

Ver `nexus-battles-mockup.html` en la raíz del repositorio para los mockups completos
con paleta de colores, tipografía y componentes UI.

## Páginas a implementar

| Página | Ruta | Estado |
|--------|------|--------|
| Login | `/login` | Pendiente |
| Register | `/register` | Pendiente |
| Dashboard | `/dashboard` | Pendiente |
| Auctions | `/auctions` | Pendiente |
| Auction Detail | `/auctions/:id` | Pendiente |
| Missions | `/missions` | Pendiente |
| Inventory | `/inventory` | Pendiente |
| Rankings | `/rankings` | Pendiente |
| Profile | `/profile` | Pendiente |
