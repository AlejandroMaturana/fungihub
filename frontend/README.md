# Frontend — Mush2

## Framework utilizado

React 18 con Vite como build tool.

## Configuración

```bash
cd frontend
pnpm install
cp .env.example .env.local
# VITE_API_URL=http://localhost:3797/api/v1
pnpm run dev
```

## Build

```bash
pnpm run build    # genera dist/
pnpm run preview  # previsualizar build
```

## Deploy

El directorio `dist/` se sirve como static site via Nginx, CDN, Vercel o Netlify.

Ver `docs/deployment.md` para más detalles.
