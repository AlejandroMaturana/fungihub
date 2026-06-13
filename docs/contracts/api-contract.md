# Contrato API REST — Mush2 v1

> Base URL: `/api/v1`
> Formato: JSON
> Autenticación: JWT via header `Authorization: Bearer <token>`
> Auth opcional en rutas de lectura (dispositivos legacy accesibles sin login)

---

## 1. Autenticación

### `POST /auth/login`
```json
// Request
{ "username": "string", "password": "string" }
// Response 200
{ "token": { "accessToken": "jwt...", "refreshToken": "..." }, "user": { "id","username","email","role" } }
```

### `POST /auth/refresh`
```json
// Request
{ "refreshToken": "string" }
// Response 200
{ "token": { "accessToken": "jwt...", "refreshToken": "..." } }
```

### `POST /auth/logout`
Requiere auth. Invalida refresh token.

### `GET /auth/me`
Requiere auth. Devuelve usuario actual.

## 2. Dispositivos

### `GET /devices`
- Response 200: `{ data: [{ id, deviceId, macAddress, chamberName, status, lastSeen, firmwareVersion, userId }] }`

### `GET /devices/:id`
- Response 200: Detalle del dispositivo con actuadores incluidos

### `POST /devices`
Requiere auth.
```json
{ "deviceId": "esp8266_001", "macAddress": "AA:BB:CC:DD:EE:FF", "chamberName": "...", "chamberLocation": "..." }
```

### `PATCH /devices/:id`
Requiere acceso al dispositivo.
```json
{ "chamberName": "...", "chamberLocation": "..." }
```

## 3. Telemetría

### `GET /devices/:id/telemetry`
- Query: `?sensorType=TEMPERATURE&from=ISO&to=ISO&limit=100`
- Response: `{ data: [{ value, sensorType, unit, timestamp }] }`

### `GET /devices/:id/telemetry/latest`
- Response: `{ temperature: 24.5, humidity: 85.2, co2: 420, voc: 15, temperature_unit: "°C", ... , ts: "ISO" }`

## 4. Control

### `GET /devices/:id/actuators`
- Response: `{ data: [{ id, channel, state, mode, lastSeen }] }`

### `PATCH /devices/:id/actuators/:channel`
Requiere acceso al dispositivo.
```json
{ "command": "ON"|"OFF" }
```

## 5. Recetas y Ciclos

### `GET /recipes` / `POST /recipes`
### `GET /recipes/:id` / `PUT /recipes/:id`
### `GET /cycles` / `POST /cycles`
### `PATCH /cycles/:id`
### `GET /cycles/:id/states`

## 6. Administración

Requiere rol ADMIN o superior.

### `GET /admin/users` / `GET /admin/users/:id`
### `PATCH /admin/users/:id/role` (requiere SUPER_ADMIN)
### `PATCH /admin/users/:id/toggle-active`
### `GET /admin/audit-logs`

## 7. Monitoreo

### `GET /monitoring/metrics`
### `GET /health/db`
### `GET /health/mqtt`
### `GET /health`

## 8. Tiempo Real

### `GET /events`
Server-Sent Events. Eventos: `ack`, `state`, `telemetry`, `alarm`, `control_eval`.

## 9. Errores

```json
// 400 Bad Request
{ "error": "VALIDATION", "message": "..." }
// 401 Unauthorized
{ "error": "Token requerido" } o { "error": "Token expirado", "code": "TOKEN_EXPIRED" }
// 403 Forbidden
{ "error": "Sin acceso a este dispositivo" }
// 404 Not Found
{ "error": "NOT_FOUND", "message": "..." }
// 429 Too Many Requests
{ "error": "Demasiadas solicitudes, intente más tarde" }
// 500 Server Error
{ "error": "SERVER_ERROR", "message": "..." }
// 503 Service Unavailable
{ "error": "MQTT_DISCONNECTED", "message": "MQTT no conectado" }
```
