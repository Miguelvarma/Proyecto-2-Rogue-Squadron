# The Nexus Battles V — Backend API

Arquitectura Hexagonal (Puertos y Adaptadores)

## Stack
- Node.js 20 LTS + Express 5 + TypeScript
- MySQL 8.0 + mysql2/promise
- Zod (validacion) + JWT + bcrypt + helmet
- Winston (logs) + PM2 (produccion)

## Inicio Rapido

```bash
cp .env.example .env
# Rellenar .env con tus credenciales
npm install
npm run dev
```

## Base de Datos

```bash
mysql -u root -p < scripts/init-db.sql
```

## Scripts
| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar TypeScript |
| `npm start` | Produccion |
| `npm run test:unit` | Tests unitarios con cobertura |
| `npm run lint` | Linter |

## Estructura
```
src/
  domain/          # Logica pura — sin dependencias externas
  application/     # Casos de uso + puertos (contratos)
  infrastructure/  # Adaptadores: DB, APIs, HTTP, seguridad
  config/          # Variables de entorno validadas
  Modulo-Chatbot   # Integración del equipo 
```

## Regla de Oro
El dominio NO importa mysql2, axios, express ni ninguna libreria de infraestructura.
Todo acceso externo pasa por un Adaptador que implementa un Contrato (Puerto).


Descripción
Módulo de chatbot inteligente para THE NEXUS BATTLES V.
Desarrollado con FastAPI (Python) + JavaScript + Groq AI.
Disponible como widget flotante en todas las vistas del sistema.

Stack tecnológico
- **Backend:** Python 3.13, FastAPI, Uvicorn
- **Frontend:** JavaScript, HTML, CSS
- **IA:** Groq API (llama-3.3-70b-versatile)
- **Contenedores:** Docker, Docker Compose

---

## Instalación y ejecución.

### Requisitos previos
- [Python 3.13+](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) *(opcional)*
- [Git](https://git-scm.com/)




