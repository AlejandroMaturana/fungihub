# Backend — Mush2

## Stack

Node.js 20 + Express 5 + Sequelize 6 + PostgreSQL 16.

## Configuración

```bash
cd backend
pnpm install
cp .env.example .env.local
# Editar credenciales en .env.local
pnpm run dev    # nodemon, puerto 3797
```

## Base de datos

```bash
pnpm run db:sync     # sincronizar modelos (desarrollo)
pnpm run db:migrate  # ejecutar migraciones
pnpm run db:seed     # sembrar datos de prueba
pnpm run db:reset    # resetear DB
```

## Tests

```bash
pnpm test          # Jest + Supertest
pnpm run test:watch
```

## API

Documentación de endpoints en `docs/contracts/api-contract.md`.
