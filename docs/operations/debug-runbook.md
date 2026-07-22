# Debug Runbook — Mush2

> Errores comunes y su solución inmediata. Si encuentras un error, busca aquí primero.

---

## Backend

### `EADDRINUSE: listen 127.0.0.1:3797`

**Causa**: Otro proceso ya usa el puerto 3797.
**Solución**:
```powershell
netstat -ano | findstr :3797
# Obtener PID de la columna derecha
taskkill /PID <PID> /F
```

---

### `SequelizeConnectionError: Connection refused`

**Causa**: PostgreSQL no está corriendo o credenciales incorrectas.
**Solución**:
1. Verificar que PostgreSQL esté corriendo: `pg_isready`
2. Verificar `.env` → `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
3. Verificar que la DB existe: `psql -U postgres -l`

---

### `SequelizeDatabaseError: relation "X" does not exist`

**Causa**: Tabla no sincronizada.
**Solución**:
```bash
cd backend && pnpm run db:sync
```

---

### `JWT_SECRET is not defined`

**Causa**: Falta variable de entorno.
**Solución**: Verificar que `.env` tenga `JWT_SECRET=<string_largo>`.

---

### `Cannot find module '../config/env.js'`

**Causa**: Backend ejecutado desde directorio incorrecto.
**Solución**: Siempre ejecutar desde `backend/`:
```bash
cd backend && pnpm dev
```

---

### `error: password authentication failed for user "X"`

**Causa**: Credenciales de DB incorrectas o usuario no existe.
**Solución**:
1. Verificar `.env` contra `pg_hba.conf`
2. En desarrollo, intentar: `psql -U postgres -c "ALTER USER <user> WITH PASSWORD '<pass>';"`

---

### Tests no ejecutan — `Cannot use import statement outside a module`

**Causa**: Falta flag ESM en Node.
**Solución**: El script de test ya incluye `--experimental-vm-modules`. Ejecutar con:
```bash
cd backend && node --experimental-vm-modules ./node_modules/jest/bin/jest.js
```

---

### `ECONNREFUSED 127.0.0.1:1883` (MQTT)

**Causa**: Broker MQTT (Mosquitto) no está corriendo.
**Solución**:
1. Verificar: `netstat -ano | findstr :1883`
2. Iniciar Mosquitto: `mosquitto -c mosquitto.conf` (o desde servicio)
3. Nota: El backend funciona sin MQTT, pero no recibirá telemetría del firmware

---

### `Rate limit exceeded` (429)

**Causa**: Se excedió el límite de requests del plan.
**Solución**: Esto es comportamiento esperado. Verificar `capability-catalog.md` para límites por plan. Si es en desarrollo, verificar que el test no esté usando un usuario FREE.

---

## Frontend

### `Failed to resolve import "X" from "Y"`

**Causa**: Importación rota o dependencia faltante.
**Solución**:
1. Verificar que el archivo existe en la ruta indicada
2. Verificar que no haya renombrado el archivo sin actualizar imports
3. Buscar en `client.js` si es una función API

---

### `proxy error` / `ECONNREFUSED` en dev server

**Causa**: Backend no está corriendo en puerto 3797.
**Solución**:
1. Iniciar backend: `cd backend && pnpm dev`
2. Verificar proxy en `vite.config.js`: `/api` → `http://localhost:3797`

---

### `401 Unauthorized` desde el frontend

**Causa**: Token expirado o no existe.
**Solución**:
1. Verificar `sessionStorage` en DevTools → Application
2. Verificar que `AuthContext.jsx` esté refrescando tokens
3. Verificar que el backend esté corriendo con JWT_SECRET correcto

---

### `No se renderiza el dashboard`

**Causa**: Puede ser error en `AlarmContext` o `useSSE`.
**Solución**:
1. Verificar consola del navegador para errores
2. Verificar que `/events` SSE endpoint responda: `curl http://localhost:3797/events`
3. Verificar que `AlarmProvider` envuelva las rutas en `App.jsx`

---

### Build falla — `vite build` error

**Causa**: Error de sintaxis JSX o importación rota.
**Solución**:
1. Ejecutar `npx vite build 2>&1 | head -50` para ver el error completo
2. Verificar el archivo indicado en el error
3. Verificar imports circulares

---

## Firmware

### `panic` / `Guru Meditation Error`

**Causa**: Stack overflow, puntero nulo, o corrupción de memoria.
**Solución**:
1. Verificar `tasks.cpp` — cada task necesita stack suficiente (definido en `tasks.h`)
2. Verificar que no haya `String` (usar `char[]`)
3. Verificar `StaticJsonDocument` no exceda el buffer asignado
4. Verificar punteros antes de desreferenciar

---

### `AHT21 not found` / `ENS160 not found`

**Causa**: Sensor no detectado en bus I2C.
**Solución**:
1. Verificar cables I2C: SDA=D2/GPIO4, SCL=D1/GPIO5
2. Verificar alimentación del sensor (3.3V)
3. Verificar dirección I2C: AHT21=`0x38`, ENS160=`0x53`
4. Ejecutar test `test/S3_test-i2c-ENS160-AHT21/` para diagnosticar

---

### WiFi no conecta

**Causa**: Credenciales incorrectas o red no disponible.
**Solución**:
1. Verificar `config.h` → `WIFI_SSID_1`, `WIFI_PASS_1`
2. Verificar que la red esté en rango
3. Verificar que `config.h` fue regenerado: `python generate_config.py`
4. Nota: `config.h` se genera desde `.env` — no editarlo directamente

---

### MQTT no conecta

**Causa**: Broker no accesible o credenciales incorrectas.
**Solución**:
1. Verificar `config.h` → `MQTT_BROKER_PRIMARY`, `MQTT_PORT`
2. Verificar que el broker esté corriendo y accesible
3. Verificar que el firewall permita puerto 1883
4. El firmware tiene fallback a broker secundario — verificar ambos

---

### OTA falla

**Causa**: URL inválida, hash incorrecto, o problemas de red.
**Solución**:
1. Verificar que la URL sea HTTPS con extensión `.bin`
2. Verificar que el binario exista en el servidor
3. Verificar conectividad de red del ESP32
4. Verificar RSSI: el decisor rechaza si RSSI < -70 dBm
5. El firmware tiene rollback automático — no quedará bricked

---

### Watchdog reset en ciclo

**Causa**: Task colgado o timeout excedido (30s SW WDT).
**Solución**:
1. Verificar `health_monitor.cpp` — identifica qué task falló
2. Verificar `tasks.cpp` — revisar que cada loop tenga `vTaskDelay`
3. Verificar que no haya `delay()` bloqueante (usar `vTaskDelay`)
4. Verificar contador de reboots en NVS — si > 5, entra en ST_SAFE

---

### Compilación falla — `undefined reference`

**Causa**: Función declarada pero no definida, o falta archivo en build.
**Solución**:
1. Verificar `platformio.ini` — `src_filter` puede excluir archivos
2. Verificar que el `.cpp` exista y tenga la función
3. Verificar `#include` en el `.h` correspondiente

---

### RAM/Flash muy alto

**Causa**: Demasiadas dependencias o buffers grandes.
**Solución**:
1. Límites seguros: RAM < 80%, Flash < 80%
2. Verificar `StaticJsonDocument` sizes — reducir buffers
3. Verificar que no haya `String` (dinámico, fragmenta heap)
4. Usar `ESP.getFreeHeap()` en logs para monitorear

---

## DB / Migraciones

### `relation already exists` al sincronizar

**Causa**: Tabla ya existe pero Sequelize no la reconoce.
**Solución**:
```bash
cd backend && pnpm run db:sync
# Esto ejecuta ALTER TABLE, no DROP
```

---

### `column "X" of relation "Y" does not exist`

**Causa**: Modelo tiene campos nuevos que la tabla no tiene.
**Solución**: `db:sync` debería agregar la columna. Si no funciona:
```bash
psql -U postgres -d mush2 -c "ALTER TABLE Y ADD COLUMN X VARCHAR(255);"
```

---

### `permission denied for table X`

**Causa**: Usuario de DB sin permisos.
**Solución**: Dar permisos al usuario:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO <user>;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO <user>;
```

---

## Patrones de Diagnóstico

### Antes de buscar un error, verifica:

1. **¿Los servicios están corriendo?** — Backend (3797), DB (5432), MQTT (1883)
2. **¿Las dependencias están instaladas?** — `pnpm install` en cada paquete
3. **¿El `.env` está completo?** — Copiar de `.env.example` y llenar
4. **¿Los puertos están libres?** — `netstat -ano | findstr :<puerto>`
5. **¿La DB existe y está sincronizada?** — `pnpm run db:sync`
6. **¿Los archivos generados existen?** — `firmware/src/config.h` se genera
