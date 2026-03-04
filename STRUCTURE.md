# Estructura inicial del proyecto: THE NEXUS BATTLES V

## Backend (Hexagonal)

```text
backend/
  src/
    domain/
      entities/
      repositories/
    application/
      usecases/
    infrastructure/
      repositories/
      http/
        controllers/
        routes/
        middlewares/
    config/
```

## Frontend (React)

```text
frontend/
  src/
    api/
    components/
      inventory/
    pages/
    router/
    styles/
```

Esta estructura es la base para implementar, en el siguiente paso, el flujo completo de inventario paginado (16 ítems por página) cumpliendo arquitectura hexagonal en backend y separación de responsabilidades en frontend.
