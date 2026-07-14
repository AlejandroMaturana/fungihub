# Deploy Railway — Hoja de Ruta

> Rama: `develop` | Fecha: 2026-07-14 | Plataforma: Railway

---

## Arquitectura del Deploy

```
┌─────────────────────────────────────────────┐
│              RAILWAY PROJECT                │
│                                             │
│  ┌─────────────┐    ┌───────────────────┐   │
│  │  PostgreSQL  │◄───│  mush2-backend    │   │
│  │  (addon)     │    │  (Node.js 20)    │   │
│  └─────────────┘    │                   │   │
│                     │  ├─ Express API   │   │
│                     │  ├─ WebSocket     │   │
│                     │  ├─ MQTT Bridge   │   │
│                     │  ├─ SSE Events    │   │
│                     │  └─ Frontend ★    │   │
│                     └───────────────────┘   │
│                                             │
│  ★ Frontend servido como estáticos desde    │
│    backend/public (Vite build output)       │
└─────────────────────────────────────────────┘
```

**Decisión clave**: Un solo servicio Railway que sirve backend + frontend. Esto elimina problemas de CORS, simplifica el deploy, y Reduce costos.

---

## Archivos Creados/Modificados

| Archivo | Acción | Propósito |
|---|---|---|
| `Dockerfile` | **Nuevo** | Multi-stage: build frontend + production backend |
| `.dockerignore` | **Nuevo** | Mantiene la imagen Docker ligera |
| `railway.toml` | **Nuevo** | Configuración de build y deploy para Railway |
| `backend/src/app.js` | **Modificado** | Sirve archivos estáticos del frontend en producción |
| `.env.example` | **Modificado** | Agregadas variables de referencia para Railway |

---

## Pasos para Deploy (Railway Dashboard)

### 1. Crear Cuenta y Proyecto
1. Ir a [railway.app](https://railway.app)
2. Sign in con GitHub
3. **New Project** > **Deploy from GitHub repo**
4. Seleccionar `AlejandroMaturana/mush2`
5. Railway detectará el `Dockerfile` automáticamente

### 2. Configurar Variables de Entorno
En **Settings > Variables**, agregar:

```bash
# Generar JWT_SECRET seguro
# (en terminal: openssl rand -hex 32)

NODE_ENV=production
JWT_SECRET=<tu-secret-generado>
CORS_ORIGIN=<tu-url-de-railway>
DB_USER=postgres
DB_NAME=mush2
```

> **Nota**: `DATABASE_URL` se inyecta automáticamente al agregar el addon PostgreSQL.
> **Nota**: `PORT` lo asigna Railway automáticamente.

### 3. Agregar PostgreSQL
1. En el proyecto Railway > **+ New** > **Database** > **PostgreSQL**
2. Railway crea las variables `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` automáticamente
3. Estas variables se conectan al servicio backend automáticamente (mismo proyecto)

### 4. Configurar Dominio (Opcional)
1. **Settings** > **Networking** > **Generate Domain**
2. Railway asigna `tu-app.up.railway.app`
3. Actualizar `CORS_ORIGIN` con esa URL

### 5. Primer Deploy
1. Railway construye automáticamente al hacer push a `develop`
2. El Dockerfile:
   - **Stage 1**: Instala pnpm, compila frontend con Vite → `frontend/dist`
   - **Stage 2**: Instala dependencias de backend (solo production), copia frontend build a `backend/public`
3. El backend sirve todo: API en `/api/v1`, frontend en `/`

### 6. Verificar
1. Abrir la URL de Railway
2. Debería cargar la Landing page de Mush2
3. Registrar un usuario
4. Verificar `/health` → `{"status":"ok","uptime":...}`
5. Verificar WebSocket en `/ws?deviceId=...`

---

## Variables de Entorno Requeridas

| Variable | Origen | Descripción |
|---|---|---|
| `NODE_ENV` | Railway | `production` |
| `PORT` | Railway (auto) | Puerto del servicio |
| `DATABASE_URL` | PostgreSQL addon | URL completa de conexión |
| `JWT_SECRET` | Manual | Secreto para firmar JWTs |
| `CORS_ORIGIN` | Manual | URL del frontend (para CORS) |

## Variables de Entorno Opcionales

| Variable | Descripción |
|---|---|
| `MQTT_BROKER` | Broker MQTT personalizado |
| `MQTT_BROKER_FALLBACK` | Broker MQTT respaldo |
| `TELEGRAM_BOT_TOKEN` | Token del bot de Telegram |
| `TELEGRAM_BOT_USERNAME` | Username del bot de Telegram |

---

## Troubleshooting

### El build falla
- Verificar que `pnpm-lock.yaml` esté commiteado
- Railway necesita el lockfile para `--frozen-lockfile`

### Frontend no carga (404)
- Verificar que `backend/public/` existe en la imagen
- Revisar logs: `railway logs`

### CORS errors
- `CORS_ORIGIN` debe coincidir exactamente con la URL del frontend
- Incluir `https://` y sin trailing slash

### WebSocket no conecta
- Railway soporta WebSocket nativamente
- El path es `/ws?deviceId=xxx`
- Verificar que el proxy no interrumpa la conexión

### Base de datos no conecta
- Verificar que el addon PostgreSQL está en el mismo proyecto
- Railway inyecta `DATABASE_URL` automáticamente
- El backend usa `env.DB.url` que lee `DATABASE_URL`

---

## Rollback

Si algo sale mal:
1. Railway mantiene historial de deploys
2. En **Deployments** > seleccionar el deploy anterior > **Rollback**
3. O hacer `git revert` en `develop` y push

---

## Comandos Útiles (Railway CLI)

```bash
# Instalar CLI
npm install -g @railway/cli

# Login
railway login

# Vincular proyecto
railway link

# Ver logs
railway logs

# Variables de entorno
railway variables

# Deploy manual
railway up
```

---

## Siguientes Pasos

- [ ] Configurar dominio personalizado (si aplica)
- [ ] Agregar GitHub Action para deploy automático en push a `develop`
- [ ] Configurar monitoreo/alertas en Railway
- [ ] Evaluar upgrade a plan pago si hay tráfico
