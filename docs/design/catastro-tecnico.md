# Catastro Técnico de Componentes de Interfaz Necesarios

> **Proyecto:** Mush2 — Sistema de Control de Cultivos
> **Propósito:** Documento oficial de requerimientos para el rediseño completo del frontend.
> **Backend:** Node.js 24 / Express 5 / Sequelize 6 / PostgreSQL 18
> **Versión:** 0.16.1

---

## Índice

1. [INVENTARIO DE ENTIDADES Y CAMPOS](#1-inventario-de-entidades-y-campos)
2. [CATÁLOGO DE ACCIONES Y PROCESOS](#2-catálogo-de-acciones-y-procesos)
3. [MAPA DE ENDPOINTS DE LA API](#3-mapa-de-endpoints-de-la-api)

---

# 1. INVENTARIO DE ENTIDADES Y CAMPOS

Cada entidad = una tabla/modelo. Se especifica si los datos son de solo lectura (RO) o requieren formularios CRUD.

---

## 1.1 User (Usuario)

**Tabla:** `users` | **PK:** `id` (UUIDv4) | **Soft Delete:** Sí (paranoid)

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | UUID | RO | Identificador único |
| `username` | STRING(64) | **CRUD** | Único. Visible en toda la app (nav, alarms, audit). |
| `email` | STRING(255) | **CRUD** | Único. Usado para notificaciones futuras. |
| `passwordHash` | STRING(255) | — | Nunca se expone. Se cambia via formulario. |
| `role` | ENUM: SUPER_ADMIN, ADMIN, OPERATOR, VIEWER | **CRUD** (solo SUPER_ADMIN) | Control de acceso. Default `OPERATOR`. |
| `isActive` | BOOLEAN | **Toggle** | Solo ADMIN/SUPER_ADMIN pueden desactivar usuarios. |
| `lastLoginAt` | DATE | RO | Auditoría. |
| `createdAt` | DATE | RO | |
| `updatedAt` | DATE | RO | |
| `deletedAt` | DATE | RO | Soft delete (solo ADMIN). |

**Requerimientos visuales:**
- **Formulario de registro**: username, email, password.
- **Formulario de login**: username, password.
- **Página de perfil**: username, email (editables), lastLoginAt, createdAt (RO).
- **Formulario de cambio de contraseña**: currentPassword, newPassword.
- **Panel de administración de usuarios**: tabla con todos los usuarios, toggle isActive, selector de role.
- **Indicador de rol**: mostrar badge/etiqueta con el rol del usuario en nav, alarms, etc.

---

## 1.2 Device (Dispositivo / Cámara)

**Tabla:** `devices` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | ID interno |
| `deviceId` | STRING(50) | RO | Identificador único del hardware (ej. "MUSH-001"). Se asigna en registro. |
| `macAddress` | STRING(50) | RO | Dirección MAC del ESP32. |
| `firmwareVersion` | STRING(20) | RO | Version del firmware (ej. "1.3.0"). |
| `hwRevision` | STRING(10) | RO | Revisión del hardware. |
| `status` | ENUM: ONLINE, OFFLINE, MAINTENANCE, ERROR | **RO + indicador** | Estado en vivo. Se actualiza via MQTT. |
| `lastSeen` | DATE | RO | Última vez que se conectó. |
| `chamberName` | STRING(128) | **CRUD** | Nombre visible de la cámara. |
| `chamberLocation` | STRING(255) | **CRUD** | Ubicación física. |
| `chamberId` | INTEGER (FK → Chamber) | **CRUD** (selector) | Asociación a Chamber. |
| `ssrActiveLow` | BOOLEAN | **CRUD** | Configuración de hardware SSR. |
| `userId` | UUID (FK → User) | RO | Dueño del dispositivo. |
| `thingSpeakEnabled` | BOOLEAN | **CRUD** | Habilita sincronización ThingSpeak. |
| `thingSpeakChannelId` | STRING(20) | **CRUD** | |
| `thingSpeakReadKey` | STRING(32) | **CRUD** | |
| `thingSpeakWriteKey` | STRING(32) | **CRUD** | |
| `thingSpeakSyncInterval` | INTEGER | **CRUD** | Intervalo en ms (default 300000). |

**Requerimientos visuales:**
- **Dashboard/tarjeta de dispositivo**: name, status (con indicador de color ONLINE/verde, OFFLINE/gris, ERROR/rojo, MAINTENANCE/amarillo), lastSeen, chamberName, última telemetría.
- **Formulario de creación/registro**: deviceId, macAddress (o registro automático desde el hardware).
- **Formulario de edición**: chamberName, chamberLocation, chamberId (selector), ssrActiveLow (toggle), todos los campos thingSpeak.
- **Lista/página de dispositivos**: tabla con filtros por status, chamberName, búsqueda por deviceId.
- **Página de detalle de dispositivo**: todos los campos + telemetría en vivo + actuadores + ciclos activos.

---

## 1.3 Chamber (Cámara de Cultivo)

**Tabla:** `chambers` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `name` | STRING(128) | **CRUD** | Nombre único. |
| `volume` | DECIMAL(10,2) | **CRUD** | Volumen en litros. |
| `location` | STRING(255) | **CRUD** | |
| `createdBy` | UUID (FK → User) | RO | |
| `updatedBy` | UUID (FK → User) | RO | |

**Requerimientos visuales:**
- **Formulario CRUD completo**: crear/editar/eliminar cámaras.
- **Selector de chamber** en formularios de device y cycles.
- **Vista de chamber**: lista de devices asociados, ciclos activos.

---

## 1.4 Sensor

**Tabla:** `sensors` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `type` | ENUM: TEMPERATURE, HUMIDITY, CO2, VOC | RO | Se crea automáticamente al recibir telemetría. |
| `channel` | INTEGER | RO | Canal del sensor. |
| `status` | ENUM: ACTIVE, INACTIVE, FAULT | **RO + indicador** | |

**Requerimientos visuales:**
- No requiere formulario CRUD explícito. Se crean automáticamente.
- **Indicador de estado** en vista de dispositivo: mostrar sensores con su tipo y estado (ACTIVE/verde, FAULT/rojo).

---

## 1.5 Telemetry (Telemetría)

**Tabla:** `telemetry` | **PK:** `id` (BIGINT auto) | **Sin timestamps** | Volumen: alta

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | BIGINT | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `sensorId` | INTEGER (FK → Sensor) | RO | |
| `value` | DECIMAL(8,2) | RO | El valor leído. |
| `sensorType` | ENUM: TEMPERATURE, HUMIDITY, CO2, VOC | RO | |
| `unit` | STRING(10) | RO | °C, %, ppm, ppb |
| `timestamp` | DATE | RO | |

**Requerimientos visuales:**
- **Gráficos de series de tiempo**: chart de temperatura, humedad, CO2, VOC por dispositivo. Selector de rango de fechas y resolución (downsampling).
- **Widget de última telemetría**: tarjetas con valor actual de cada sensor, con unidad, y timestamp.
- **Tooltip/gauge en dashboard**: mostrar valores en vivo con actualización periódica.
- **Selector de tipo de sensor**: para filtrar qué métrica mostrar.

---

## 1.6 Actuator (Actuador)

**Tabla:** `actuators` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `channel` | INTEGER | RO | 1=Vent, 2=Heater, 3=Humidifier |
| `type` | STRING(20) | RO | Ej. "SSR" |
| `label` | STRING(50) | **CRUD** | Nombre visible. |
| `state` | STRING(10) | **CRUD** | ON/OFF. Se controla desde UI. |
| `mode` | STRING(10) | **CRUD** | LOCAL (manual) / REMOTE (automático). |
| `lastCommand` | STRING(50) | RO | Último comando enviado. |
| `lastAck` | STRING(20) | RO | Último acknowledgment del hardware. |
| `lastSeen` | DATE | RO | |

**Requerimientos visuales:**
- **Panel de control de actuadores**: toggle/interruptor ON/OFF por cada canal.
- **Indicador de modo**: LOCAL vs REMOTE. En REMOTE, la UI no debe permitir control manual.
- **Indicador de estado**: ON (verde/rojo), OFF (gris). Animación de transición.
- **Timeline de comandos**: historial de lastCommand + lastAck.

---

## 1.7 Alarm (Alarma)

**Tabla:** `alarms` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `type` | ENUM: SENSOR_FAULT, OUT_OF_RANGE, DISCONNECTED, SYSTEM_ERROR, THRESHOLD_CROSSED | RO | |
| `severity` | ENUM: LOW, MEDIUM, HIGH, CRITICAL | RO | |
| `message` | STRING(500) | RO | Texto descriptivo. |
| `sensorType` | ENUM: TEMPERATURE, HUMIDITY, CO2, VOC | RO | Null si no aplica. |
| `currentValue` | DECIMAL(10,2) | RO | |
| `thresholdMin` | DECIMAL(10,2) | RO | |
| `thresholdMax` | DECIMAL(10,2) | RO | |
| `isAcknowledged` | BOOLEAN | **Acción** | Botón "Reconocer". |
| `acknowledgedBy` | UUID (FK → User) | RO | Quién reconoció. |
| `acknowledgedAt` | DATE | RO | |
| `resolvedAt` | DATE | RO | Se resuelve automáticamente o manual. |
| `metadata` | JSONB | RO | Datos extra. |

**Requerimientos visuales:**
- **Panel/lista de alarmas**: tabla con filtros por severity, type, estado (activa/resuelta), deviceId.
- **Badge de alarmas no resueltas**: contador en nav/sidebar.
- **Badge por severidad**: color coding (CRITICAL/rojo, HIGH/naranja, MEDIUM/amarillo, LOW/gris).
- **Botón "Reconocer"**: para alarmas no reconocidas.
- **Botón "Resolver"**: opcional para resolución manual.
- **Modal/detalle de alarma**: mostrar todos los campos, incluyendo quién reconoció.
- **Timeline/evento de alarma**: mostrar cuándo se creó, reconoció y resolvió.

---

## 1.8 ApiKey (Clave API)

**Tabla:** `api_keys` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `userId` | UUID (FK → User) | RO | |
| `keyPrefix` | STRING(12) | RO | Prefijo visible. |
| `name` | STRING(128) | **CRUD** | Nombre descriptivo. |
| `permissions` | JSONB: { read, write, admin } | **CRUD** | Checkboxes de permisos. |
| `ipWhitelist` | JSONB: string[] | **CRUD** | Lista de IPs permitidas. |
| `rateLimit` | INTEGER | **CRUD** | Límite por minuto (default 100). |
| `expiresAt` | DATE | **CRUD** | Fecha de expiración opcional. |
| `lastUsedAt` | DATE | RO | |
| `lastIpAddress` | STRING(45) | RO | |
| `authFailures` | INTEGER | RO | Contador de fallos. |
| `isActive` | BOOLEAN | **CRUD** (toggle) | Revocar/activar. |

**Requerimientos visuales:**
- **Página de gestión de API keys**: tabla con todas las keys del usuario.
- **Botón "Crear API Key"**: modal/formulario con name, permissions (read/write/admin checkboxes), ipWhitelist (input de tags), rateLimit, expiresAt (date picker opcional).
- **Modal "Key creada"**: mostrar raw key (UNA SOLA VEZ) con advertencia.
- **Botón "Rotar"**: genera nueva key, muestra raw key una vez.
- **Botón "Revocar"**: toggle isActive.
- **Indicadores**: lastUsedAt, lastIpAddress, authFailures, estado activo/inactivo.

---

## 1.9 Recipe (Receta de Cultivo)

**Tabla:** `recipes` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `userId` | UUID (FK → User) | RO | |
| `name` | STRING(100) | **CRUD** | |
| `species` | STRING(100) | **CRUD** | |
| `incubationTempMin` | DECIMAL(5,2) | **CRUD** | |
| `incubationTempMax` | DECIMAL(5,2) | **CRUD** | |
| `incubationHumMin` | DECIMAL(5,2) | **CRUD** | |
| `incubationHumMax` | DECIMAL(5,2) | **CRUD** | |
| `incubationCo2Max` | INTEGER | **CRUD** | Default 1200 |
| `incubationDurationDays` | INTEGER | **CRUD** | |
| `fruitingTempMin` | DECIMAL(5,2) | **CRUD** | |
| `fruitingTempMax` | DECIMAL(5,2) | **CRUD** | |
| `fruitingHumMin` | DECIMAL(5,2) | **CRUD** | |
| `fruitingHumMax` | DECIMAL(5,2) | **CRUD** | |
| `fruitingCo2Max` | INTEGER | **CRUD** | Default 800 |
| `fruitingDurationDays` | INTEGER | **CRUD** | |
| `maintenanceTempMin` | DECIMAL(5,2) | **CRUD** | |
| `maintenanceTempMax` | DECIMAL(5,2) | **CRUD** | |
| `maintenanceHumMin` | DECIMAL(5,2) | **CRUD** | |
| `maintenanceHumMax` | DECIMAL(5,2) | **CRUD** | |
| `maintenanceCo2Max` | INTEGER | **CRUD** | Default 1000 |
| `faeIntervalMinutes` | INTEGER | **CRUD** | Default 60 |
| `ventilationStrategy` | ENUM: TIMER, CO2_TRIGGER, HYBRID | **CRUD** | |
| `lightCycleHours` | INTEGER | **CRUD** | Default 12 |
| `faeLevel` | ENUM: LOW, MEDIUM, HIGH | **CRUD** | |
| `dewPointMaxRH` | DECIMAL(5,2) | **CRUD** | Default 95.0 |

**Requerimientos visuales:**
- **Página de recetas**: lista/tarjetas con nombre y especie.
- **Formulario de creación/edición**: formulario extenso organizado en secciones por fase (Incubation, Fruiting, Maintenance) con inputs numéricos. Selectores para ENUMs.
- **Vista de detalle de receta**: mostrar todos los parámetros agrupados por fase.
- **Selector de receta** al crear un ciclo de cultivo.

---

## 1.10 CultivationCycle (Ciclo de Cultivo)

**Tabla:** `cultivation_cycles` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `userId` | UUID (FK → User) | RO | |
| `deviceId` | INTEGER (FK → Device) | **CRUD** | |
| `chamberId` | INTEGER (FK → Chamber) | **CRUD** | |
| `recipeId` | INTEGER (FK → Recipe) | **CRUD** | |
| `species` | STRING(100) | **CRUD** | |
| `strain` | STRING(100) | **CRUD** | |
| `status` | ENUM: PLANNED, ACTIVE, COMPLETED, ABORTED | **CRUD** | |
| `currentPhase` | ENUM: INCUBATION, FRUITING, MAINTENANCE, COMPLETED | **CRUD** | |
| `startDate` | DATEONLY | **CRUD** | |
| `endDate` | DATEONLY | **CRUD** | |
| `notes` | TEXT | **CRUD** | |

**Requerimientos visuales:**
- **Página de ciclos**: lista/tabla con especie, device, status, currentPhase, fechas.
- **Formulario de creación**: selector de recipe + device/chamber + species + strain + startDate + notes.
- **Formulario de edición**: cambiar status, currentPhase, endDate, notes.
- **Timeline visual del ciclo**: mostrar progreso INCUBATION → FRUITING → MAINTENANCE → COMPLETED, con días transcurridos en cada fase.
- **Indicador de fase actual**: badge/pill.

---

## 1.11 CycleState (Estado de Ciclo — snapshot)

**Tabla:** `cycle_states` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `cycleId` | INTEGER (FK → CultivationCycle) | RO | |
| `phase` | ENUM: INCUBATION, FRUITING, MAINTENANCE | RO | |
| `temperature` | DECIMAL(5,2) | RO | |
| `humidity` | DECIMAL(5,2) | RO | |
| `co2` | INTEGER | RO | |
| `voc` | INTEGER | RO | |
| `vpd` | DECIMAL(5,3) | RO | Vapor Pressure Deficit calculado. |
| `actuatorStates` | JSONB | RO | Snapshot de estados de actuadores. |
| `snapshotDate` | DATE | RO | Default NOW. |

**Requerimientos visuales:**
- **Gráfico de historial de ciclo**: temperatura, humedad, CO2, VPD a través del tiempo del ciclo.
- **Tabla de snapshots**: lista de snapshots ordenados por fecha descendente.
- **No requiere formularios CRUD** — se crean automáticamente por el control engine.

---

## 1.12 Event (Evento del Sistema)

**Tabla:** `events` | **PK:** `id` (INTEGER auto) | **Sin timestamps** (usa campo timestamp propio)

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `type` | ENUM: ACTUATOR_CHANGE, STATE_TRANSITION, SYSTEM_BOOT, FIRMWARE_UPDATE | RO | |
| `payload` | JSONB | RO | Datos variables del evento. |
| `timestamp` | DATE | RO | |

**Requerimientos visuales:**
- **Timeline/log de eventos por dispositivo**: lista filtrable por type y rango de fechas.
- **No requiere formularios CRUD** — solo lectura.

---

## 1.13 AuditLog (Registro de Auditoría)

**Tabla:** `audit_logs` | **PK:** `id` (UUIDv4) | **Timestamps:** solo createdAt

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | UUID | RO | |
| `userId` | UUID (FK → User) | RO | |
| `action` | STRING(64) | RO | Ej. REGISTER, LOGIN, DEVICE_CREATE, ALARM_ACK |
| `resource` | STRING(64) | RO | Ej. auth, device, recipe, alarm |
| `resourceId` | STRING(64) | RO | ID del recurso afectado. |
| `details` | JSONB | RO | Payload de contexto. |
| `ip` | STRING(45) | RO | |
| `userAgent` | STRING(255) | RO | |
| `createdAt` | DATE | RO | |

**Requerimientos visuales:**
- **Página de auditoría (solo ADMIN/SUPER_ADMIN)**: tabla paginada con filtros por action, resource, fecha, búsqueda de texto. Incluir nombre de usuario asociado.
- **No requiere formularios CRUD** — solo lectura.

---

## 1.14 UserChamberAccess (Acceso Compartido a Dispositivos)

**Tabla:** `user_chamber_access` | **PK:** `id` (UUIDv4) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | UUID | RO | |
| `userId` | UUID (FK → User) | RO | Usuario invitado. |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `role` | ENUM: OWNER, EDITOR, VIEWER | **CRUD** | Nivel de acceso. |
| `invitedBy` | UUID (FK → User) | RO | |
| `acceptedAt` | DATE | RO | |

**Requerimientos visuales:**
- **Panel de "Compartir dispositivo"**: lista de usuarios con acceso, selector para agregar usuario por username/email.
- **Selector de role** en el invitado: OWNER (propietario), EDITOR (lectura/escritura), VIEWER (solo lectura).
- **No se crea directamente** — se genera al hacer "Claim" de dispositivo o al invitar.

---

## 1.15 UserPreference (Preferencias de Usuario)

**Tabla:** `user_preferences` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `userId` | UUID (FK → User) | RO | Creada automáticamente. |
| `theme` | ENUM: dark, light | **CRUD** | Selector de tema. |
| `language` | ENUM: es, en | **CRUD** | Selector de idioma. |
| `dateFormat` | STRING(32) | **CRUD** | Formato de fecha. |
| `defaultDashboard` | STRING(64) | **CRUD** | Página por defecto. |
| `refreshFrequency` | INTEGER | **CRUD** | ms (default 5000). |
| `pushNotifications` | BOOLEAN | **CRUD** | |
| `alertSounds` | BOOLEAN | **CRUD** | |
| `emailAlerts` | BOOLEAN | **CRUD** | |
| `telegramEnabled` | BOOLEAN | **CRUD** | |
| `telegramChatId` | STRING(64) | RO | Se asigna al vincular Telegram. |
| `telegramLinkToken` | STRING(32) | RO | Token de enlace temporal. |
| `telegramLinkTokenExpires` | DATE | RO | |
| `webhookUrl` | STRING(512) | **CRUD** | |
| `minAlertSeverity` | ENUM: info, warning, critical | **CRUD** | |

**Requerimientos visuales:**
- **Página de preferencias de usuario**: toggles, selectores, inputs.
- **Selector de tema** (dark/light) con preview visual.
- **Selector de idioma**.
- **Input de webhookUrl**.
- **Sección de Telegram**: estado del enlace (vinculado/no vinculado), botón "Vincular Telegram" que muestra un código para enviar al bot.
- **No requiere CRUD independiente** — se edita junto con el perfil de usuario.

---

## 1.16 SystemSetting (Configuración del Sistema)

**Tabla:** `system_settings` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `key` | STRING(128) | RO | Único. |
| `value` | TEXT | **CRUD** | |
| `type` | ENUM: string, number, boolean, json | RO | Define el input type. |
| `label` | STRING(255) | RO | |
| `description` | TEXT | RO | |
| `category` | STRING(64) | RO | Agrupación lógica. |
| `isPublic` | BOOLEAN | RO | |

**Categorías existentes:**

| Categoría | Keys | UI Esperada |
|-----------|------|-------------|
| `installation` | app_name, app_environment, setup_completed | RO |
| `timing` | sensor_read_interval_ms, actuator_write_interval_ms, telemetry_sync_interval_ms, alarm_check_interval_ms, dashboard_refresh_ms, session_timeout_minutes | Inputs numéricos |
| `storage` | telemetry_retention_days, alarm_retention_days, event_retention_days, max_telemetry_rows_per_query | Inputs numéricos |
| `environment` | temp_unit, pressure_unit, co2_unit | Selectores |
| `states` | default_cycle_status, offline_threshold_seconds | Selector + input |
| `alarms` | alarm_auto_resolve_minutes, max_alarms_per_device | Inputs numéricos |
| `integration` | thingspeak_enabled, telegram_bot_token, telegram_bot_username, telegram_bot_enabled, api_rate_limit_per_minute, webhook_retry_count | Toggles, inputs, text fields |
| `ota` | ota_enabled, ota_check_interval_hours, ota_firmware_url, ota_auto_update | Toggle + inputs |

**Requerimientos visuales:**
- **Página de configuración del sistema (solo SUPER_ADMIN)**: formulario agrupado por categorías en accordeones/tabs.
- **Inputs dinámicos según type**: string→input text, number→input number, boolean→toggle switch, json→textarea.
- **Botón "Seed defaults"**: para restaurar valores por defecto.
- **Sección de configuración de Telegram Bot**: token, username, test de conexión.

---

## 1.17 TelegramDeviceConfig (Config. de Alertas Telegram por Dispositivo)

**Tabla:** `telegram_device_configs` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `enabled` | BOOLEAN | **CRUD** | |
| `alertOnFault` | BOOLEAN | **CRUD** | |
| `alertOnRange` | BOOLEAN | **CRUD** | |
| `alertOnDisconnect` | BOOLEAN | **CRUD** | |
| `alertOnSystem` | BOOLEAN | **CRUD** | |
| `minSeverity` | ENUM: LOW, MEDIUM, HIGH, CRITICAL | **CRUD** | |

**Requerimientos visuales:**
- **Panel de configuración de alertas por dispositivo**: toggles para cada tipo de alerta + selector de severidad mínima.
- **Sección dentro de la página de detalle del dispositivo** o página de settings del dispositivo.

---

## 1.18 IntegrationCredentials (Credenciales de Integración)

**Tabla:** `integration_credentials` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `deviceId` | INTEGER (FK → Device) | RO | |
| `provider` | ENUM: THINGSPEAK, INFLUXDB, MQTT, CUSTOM | **CRUD** | |
| `encryptedCredentials` | TEXT | — | Cifrado AES-256-GCM. No se expone. |
| `status` | ENUM: ACTIVE, ERROR, DISABLED | **RO + indicador** | |
| `lastUsed` | DATE | RO | |
| `lastError` | STRING(500) | RO | |

**Requerimientos visuales:**
- **Formulario de configuración de integración por dispositivo**: selector de provider, campos de credenciales según provider (API keys, tokens, URLs).
- **Indicador de estado**: ACTIVE/verde, ERROR/rojo, DISABLED/gris.
- **Botón "Probar conexión"**: para validar credenciales.
- **Sección dentro de página de detalle de dispositivo**.

---

## 1.19 Subscription (Suscripción)

**Tabla:** `subscriptions` | **PK:** `id` (INTEGER auto) | **Timestamps:** Sí

| Campo | Tipo | UI | Notas |
|-------|------|----|-------|
| `id` | INTEGER | RO | |
| `userId` | UUID (FK → User) | RO | |
| `plan` | ENUM: FREE, BASIC, PREMIUM | **CRUD** (upgrade) | |
| `status` | ENUM: ACTIVE, CANCELED, PAST_DUE | **RO + badge** | |
| `apiCallsPerMonth` | INTEGER | RO | Según plan. |
| `apiCallsUsedThisMonth` | INTEGER | RO | Contador de uso. |
| `dataRetentionDays` | INTEGER | RO | Según plan. |
| `currentPeriodStart` | DATE | RO | |
| `currentPeriodEnd` | DATE | RO | |
| `canceledAt` | DATE | RO | |

**Requerimientos visuales:**
- **Página de suscripción**: tarjeta con plan actual (FREE/gris, BASIC/azul, PREMIUM/dorado), barra de progreso de uso de API calls, días de retención, fechas del período.
- **Botón "Mejorar plan"**: abre modal comparativo de planes (FREE→BASIC→PREMIUM) con tabla de features.
- **Botón "Cancelar suscripción"**: modal de confirmación.
- **Panel admin**: tabla de todas las suscripciones con usuario asociado.

---

## 1.20 VPD Calculado (Métrica Derivada)

No es una tabla, pero se calcula en cada analytics request y en controlEngine:

```
VPD = ((100 - humidity) / 100) * es
es = 0.6108 * exp((17.27 * temp) / (temp + 237.3))
```

**Requerimientos visuales:**
- **Widget/gauge de VPD**: mostrar en dashboard de dispositivo y analytics.
- **Indicador de riesgo asociado**: verde (0.8-1.2 kPa), amarillo (1.2-1.8), rojo (>1.8 o <0.4).
- Unidad: kPa.

---

# 2. CATÁLOGO DE ACCIONES Y PROCESOS

Cada acción = función de backend que necesita un botón, trigger o flujo visual.

---

## 2.1 Autenticación y Seguridad

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Registrarse** | Formulario de registro | `POST /auth/register` | Crea usuario + suscripción FREE |
| **Iniciar sesión** | Formulario de login | `POST /auth/login` | Valida credenciales, devuelve JWT |
| **Cerrar sesión** | Botón "Logout" en nav | `POST /auth/logout` | Revoca refresh token |
| **Refrescar token** | Automático (interceptor) | `POST /auth/refresh` | Rotación silenciosa de tokens |
| **Cambiar contraseña** | Formulario en settings | `POST /settings/change-password` | Valida contraseña actual |
| **Ver perfil** | Página de perfil | `GET /auth/me` | |
| **Editar perfil** | Formulario en settings | `PATCH /auth/me` | username, email |

---

## 2.2 Gestión de Dispositivos

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Listar dispositivos** | Página principal/dashboard | `GET /devices` | |
| **Crear/registrar dispositivo** | Formulario o wizard | `POST /devices` | findOrCreate por deviceId. Asigna OWNER. |
| **Ver detalle** | Click en tarjeta/fila | `GET /devices/:id` | Incluye actuadores. |
| **Editar dispositivo** | Formulario en detalle | `PATCH /devices/:id` | chamberName, thingSpeak, SSR, etc. |
| **Claim dispositivo** | Botón "Reclamar" | `POST /devices/:id/claim` | Solo si no tiene dueño. |
| **Eliminar dispositivo** | Botón "Eliminar" + confirmación | `DELETE /devices/:id` | Borra device + actuadores + telemetría. |
| **Ver ciclo activo** | Sección en detalle | `GET /devices/:id/cycle` | |
| **Ver telemetría (última)** | Widget en dashboard | `GET /devices/:id/telemetry/latest` | |
| **Ver historial telemetría** | Gráfico/selector de fecha | `GET /devices/:id/telemetry` | Soporta downsampling por resolución. |
| **Listar actuadores** | Panel de control | `GET /devices/:id/actuators` | |
| **Controlar actuador** | Toggle ON/OFF | `PATCH /devices/:id/actuators/:channel` | WebSocket update + MQTT publish |
| **Validar ThingSpeak** | Botón "Probar" en integraciones | `POST /devices/:id/thingSpeak/validate` | |
| **Listar integraciones** | Sección integraciones | `GET /devices/:id/integrations` | |
| **Configurar ThingSpeak** | Formulario en integraciones | `POST /devices/:id/integrations/thingspeak` | Guarda credenciales cifradas. |

---

## 2.3 Control de Actuadores (vía IoT)

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Obtener estado + setpoints** | Panel de control del dispositivo | `GET /actuators/?deviceId=...` | Devuelve thresholds del ciclo activo. |
| **Enviar comando directo** | Toggle/interruptor | `PATCH /actuators/:channel` | Similar a devices/:id/actuators/:channel pero usa deviceId en body. |

---

## 2.4 Gestión de Alarmas

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Listar alarmas** | Página de alarmas | `GET /alarms/` | Filtros por severity, status, deviceId, paginación. |
| **Ver stats de alarmas** | Badge en nav/resumen | `GET /alarms/stats` | Conteo por severidad. |
| **Reconocer alarma** | Botón "Reconocer" | `PATCH /alarms/:id/acknowledge` | |
| **Resolver alarma** | Botón "Resolver" | `PATCH /alarms/:id/resolve` | |

---

## 2.5 Gestión de Recetas y Ciclos

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Listar recetas** | Página de recetas | `GET /recipes` | |
| **Ver receta** | Click en receta | `GET /recipes/:id` | |
| **Crear receta** | Formulario de receta | `POST /recipes` | Campos por fase. |
| **Editar receta** | Formulario de receta | `PUT /recipes/:id` | Full update. |
| **Listar ciclos** | Página de ciclos | `GET /cycles` | Incluye recipe. |
| **Crear ciclo** | Formulario de ciclo | `POST /cycles` | Asocia recipe + device + chamber. |
| **Editar ciclo** | Formulario en detalle | `PATCH /cycles/:id` | Cambiar status, phase, notas. |
| **Ver snapshots de ciclo** | Gráfico/tabla en ciclo | `GET /cycles/:id/states` | |

---

## 2.6 Gestión de API Keys

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Listar API keys** | Página API keys | `GET /api-keys/` | |
| **Crear API key** | Botón + formulario | `POST /api-keys/` | Modal con raw key (una vez). |
| **Editar API key** | Formulario en fila | `PATCH /api-keys/:id` | |
| **Revocar API key** | Botón "Revocar" | `DELETE /api-keys/:id` | Desactiva la key. |
| **Rotar API key** | Botón "Rotar" | `POST /api-keys/:id/rotate` | Nueva raw key (una vez). |

---

## 2.7 Administración

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Listar usuarios** | Panel admin | `GET /admin/users` | |
| **Ver usuario** | Click en usuario | `GET /admin/users/:id` | |
| **Cambiar rol** | Selector de rol | `PATCH /admin/users/:id/role` | Solo SUPER_ADMIN. |
| **Activar/desactivar usuario** | Toggle isActive | `PATCH /admin/users/:id/toggle-active` | |
| **Ver audit logs** | Página de auditoría | `GET /admin/audit-logs` | Paginado, filtrable. |
| **Listar suscripciones** | Panel admin | `GET /subscriptions/` | Con usuario asociado. |

---

## 2.8 Suscripciones

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Ver mi suscripción** | Página de suscripción | `GET /subscriptions/mine` | |
| **Ver uso de API** | Barra de progreso | `GET /subscriptions/mine/usage` | calls usados, %, reset date |
| **Mejorar plan** | Modal de upgrade | `PATCH /subscriptions/mine/upgrade` | Valida upgrade order. |
| **Cancelar suscripción** | Modal de confirmación | `PATCH /subscriptions/mine/cancel` | |

---

## 2.9 Settings y Preferencias

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Ver perfil + preferencias** | Página settings | `GET /settings/profile` | |
| **Editar perfil + preferencias** | Formulario de settings | `PATCH /settings/profile` | user fields + preferences |
| **Ver config del sistema** | Panel SUPER_ADMIN | `GET /settings/system` | |
| **Actualizar config sistema** | Formulario de settings | `PATCH /settings/system` | Bulk update key/value |
| **Seed defaults** | Botón "Restaurar defaults" | `POST /settings/system/seed` | |
| **Ver config pública** | Página pública (login, landing) | `GET /settings/system/public` | Sin auth. |

---

## 2.10 Telegram

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Vincular Telegram** | Botón + código | `POST /telegram/link` | Genera código de 8 chars. |
| **Ver estado de enlace** | Indicador en settings | `GET /telegram/link` | |
| **Desvincular Telegram** | Botón "Desvincular" | `POST /telegram/unlink` | |
| **Ver config de alertas por device** | Sección en device detail | `GET /telegram/device/:deviceId` | |
| **Editar config de alertas** | Toggles en device | `PATCH /telegram/device/:deviceId` | |
| **Configurar bot Telegram global** | Panel admin | `POST /telegram/configure` | Token + username. |
| **Ver estado del bot** | Indicador en admin | `GET /telegram/bot-status` | Running/stopped, lastError. |

---

## 2.11 Analytics

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Ver analytics de cámara** | Página de analytics | `GET /chambers/:chamberId/analytics` | Payload completo: telemetry, VPD, risks, ciclo activo, efficiency. |

---

## 2.12 Eventos

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Listar eventos** | Página de eventos | `GET /events/` | Filtros por type, deviceId, fecha. |
| **Listar eventos por device** | Sección en device | `GET /events/device/:deviceId` | |

---

## 2.13 Monitoreo y Diagnóstico

| Acción | Gatillador UI | Endpoint | Descripción |
|--------|--------------|----------|-------------|
| **Ver métricas del sistema** | Panel de monitoreo | `GET /monitoring/metrics` | Uptime, devices, telemetry count, etc. |
| **Health check DB** | Indicador de salud | `GET /monitoring/health/db` | |
| **Ver estado MQTT** | Panel de diagnóstico | `GET /diag/mqtt` | Broker status, SSR states. |
| **Publicar mensaje MQTT test** | Botón en diagnóstico | `POST /diag/mqtt/publish` | Solo ADMIN. |

---

## 2.14 Procesos Background (Sin UI directa, pero con indicadores)

| Proceso | Intervalo | Descripción | Indicador UI |
|---------|-----------|-------------|--------------|
| **Control Engine** | Cada 60s | Evalúa ciclos activos, calcula desviaciones, genera comandos de actuadores, crea/resuelve alarmas, transiciona fases. | Indicador de fase actual, estado de actuadores en automático. |
| **Data Retention Job** | Cada 60min | Purga audit logs por plan, telemetry y alarms por retención global mínima. | No requiere UI directa. |
| **ThingSpeak Sync** | Cada 60s (global) + intervalo por device | Sincroniza telemetría desde ThingSpeak. | Indicador "última sincronización" en configuración del device. |
| **WebSocket Server** | Tiempo real | Conexiones persistentes por deviceId para actualizaciones en vivo de actuadores. | Indicador de conexión. |
| **MQTT Bridge** | Tiempo real | Escucha telemetría, status, alarmas y acks desde dispositivos IoT. Publica comandos de actuadores. | Indicador de conexión MQTT. |
| **SSE Events** | Tiempo real | Server-Sent Events para streaming de telemetría, alarmas, estados. | Conexión automática — la UI escucha eventos. |

---

## 2.15 Procesos Automáticos del Backend (Sin interacción)

| Proceso | Descripción |
|---------|-------------|
| **Auth dual** | JWT + API Key fallback. API keys soportan IP whitelist, expiración, conteo de fallos. |
| **RBAC** | Jerarquía de roles: SUPER_ADMIN(100) > ADMIN(80) > OPERATOR(50) > VIEWER(10). |
| **Rate limiting por plan** | SubscriptionRateLimit middleware cuenta calls por usuario/mes y bloquea con 429 si excede. |
| **Tenant scoping** | Filtra queries de datos por usuario autopropietario. |
| **Device access control** | Dueño > UserChamberAccess > legacy (acceso público). |

---

# 3. MAPA DE ENDPOINTS DE LA API

URL Base: `/api/v1`

---

## 3.1 Autenticación — `/auth`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| POST | `/auth/register` | — | `{ username, email, password }` | `201: { token: { accessToken, refreshToken, expiresIn }, user }` |
| POST | `/auth/login` | — | `{ username, password }` | `200: { token: { accessToken, refreshToken, expiresIn }, user }` |
| POST | `/auth/refresh` | — | `{ refreshToken }` | `200: { token }` |
| POST | `/auth/logout` | JWT | — | `200: { message }` |
| GET | `/auth/me` | JWT | — | `200: { id, username, email, role, lastLoginAt, createdAt }` |
| PATCH | `/auth/me` | JWT | `{ username?, email? }` | `200: { id, username, email, role }` |

---

## 3.2 Dispositivos — `/`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/devices` | optionalAuth | — | `200: Device[]` |
| POST | `/devices` | optionalAuth | `{ deviceId, macAddress?, chamberName?, ... }` | `201: Device` |
| POST | `/devices/register` | optionalAuth | `{ deviceId, macAddress?, firmwareVersion?, hwRevision? }` | `200: Device` |
| POST | `/devices/:id/claim` | optionalAuth | `{ chamberName?, chamberLocation?, chamberId? }` | `200: Device` |
| GET | `/devices/:id` | optionalAuth | — | `200: Device (with actuators)` |
| PATCH | `/devices/:id` | optionalAuth | `{ chamberName?, chamberLocation?, chamberId?, ssrActiveLow?, ... }` | `200: Device` |
| DELETE | `/devices/:id` | optionalAuth | — | `200: { message }` |
| GET | `/devices/:id/cycle` | optionalAuth | — | `200: CultivationCycle (with Recipe)` |
| GET | `/devices/:id/telemetry/latest` | optionalAuth | — | `200: Telemetry[]` (una por sensorType) |
| GET | `/devices/:id/telemetry` | optionalAuth | `?sensorType&from&to&limit&resolution` | `200: Telemetry[]` |
| GET | `/devices/:id/actuators` | optionalAuth | — | `200: Actuator[]` |
| PATCH | `/devices/:id/actuators/:channel` | optionalAuth | `{ command: "ON"\|"OFF" }` | `200: Actuator` |
| POST | `/devices/:id/thingSpeak/validate` | optionalAuth | `{ apiKey }` | `200: { channelList }` |
| GET | `/devices/:id/integrations` | optionalAuth | — | `200: IntegrationCredentials[]` |
| POST | `/devices/:id/integrations/thingspeak` | optionalAuth | `{ channelId, readKey?, writeKey?, syncInterval? }` | `201: IntegrationCredentials` |

---

## 3.3 Actuadores (IoT directo) — `/actuators`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| GET | `/actuators/` | optionalAuth | `?deviceId=...` | `200: { deviceId, actuators[], setpoints }` |
| PATCH | `/actuators/:channel` | optionalAuth | `{ deviceId, command: "ON"\|"OFF" }` | `200: Actuator` |

---

## 3.4 Alarmas — `/alarms`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/alarms/` | JWT | `?severity&status=active\|resolved&deviceId&page&limit` | `200: { data, pagination }` |
| GET | `/alarms/stats` | JWT | — | `200: { CRITICAL, HIGH, MEDIUM, LOW, total }` |
| PATCH | `/alarms/:id/acknowledge` | JWT | — | `200: Alarm` |
| PATCH | `/alarms/:id/resolve` | JWT | — | `200: Alarm` |

---

## 3.5 Recetas — `/recipes`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| GET | `/recipes` | optionalAuth | — | `200: Recipe[]` |
| GET | `/recipes/:id` | optionalAuth | — | `200: Recipe` |
| POST | `/recipes` | optionalAuth | `{ name, species, ... phase fields }` | `201: Recipe` |
| PUT | `/recipes/:id` | optionalAuth | `{ name, species, ... phase fields }` | `200: Recipe` |

---

## 3.6 Ciclos de Cultivo — `/cycles`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/cycles` | optionalAuth | — | `200: CultivationCycle[]` (with Recipe) |
| POST | `/cycles` | optionalAuth | `{ recipeId, species, strain?, startDate?, deviceId?, chamberId?, notes? }` | `201: CultivationCycle` |
| PATCH | `/cycles/:id` | optionalAuth | `{ status?, currentPhase?, endDate?, notes? }` | `200: CultivationCycle` |
| GET | `/cycles/:id/states` | optionalAuth | `?limit` | `200: CycleState[]` |

---

## 3.7 API Keys — `/api-keys`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/api-keys/` | JWT + ADMIN | `?page&limit` | `200: { data, pagination }` |
| POST | `/api-keys/` | JWT + ADMIN | `{ name?, permissions?, ipWhitelist?, rateLimit?, expiresAt? }` | `201: { data: { rawKey, ... }, message }` |
| PATCH | `/api-keys/:id` | JWT + ADMIN | `{ name?, permissions?, ipWhitelist?, rateLimit?, expiresAt? }` | `200: ApiKey` |
| DELETE | `/api-keys/:id` | JWT + ADMIN | — | `200: { message }` |
| POST | `/api-keys/:id/rotate` | JWT + ADMIN | — | `200: { data: { rawKey, ... }, message }` |

---

## 3.8 Administración — `/admin`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/admin/users` | JWT + ADMIN | — | `200: User[]` |
| GET | `/admin/users/:id` | JWT + ADMIN | — | `200: User` |
| PATCH | `/admin/users/:id/role` | JWT + SUPER_ADMIN | `{ role }` | `200: User` |
| PATCH | `/admin/users/:id/toggle-active` | JWT + ADMIN | — | `200: User` |
| GET | `/admin/audit-logs` | JWT + ADMIN | `?page&limit&action&resource&search&from&to` | `200: { data, pagination }` |

---

## 3.9 Settings — `/settings`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| GET | `/settings/profile` | JWT | — | `200: { data: { user, preferences } }` |
| PATCH | `/settings/profile` | JWT | `{ username?, email?, preferences? }` | `200: { data: { user, preferences } }` |
| POST | `/settings/change-password` | JWT | `{ currentPassword, newPassword }` | `200: { message }` |
| GET | `/settings/system` | JWT + SUPER_ADMIN | — | `200: { data: SystemSetting[] }` |
| PATCH | `/settings/system` | JWT + SUPER_ADMIN | `{ settings: [{ key, value }] }` | `200: { data, message }` |
| POST | `/settings/system/seed` | JWT + SUPER_ADMIN | — | `200: { data, message }` |
| GET | `/settings/system/public` | — | — | `200: { data: SystemSetting[] }` |

---

## 3.10 Suscripciones — `/subscriptions`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/subscriptions/mine` | JWT | — | `200: { data: Subscription }` |
| GET | `/subscriptions/mine/usage` | JWT | — | `200: { data: { plan, status, apiCallsPerMonth, apiCallsUsedThisMonth, percentage, dataRetentionDays, currentPeriodStart, currentPeriodEnd } }` |
| PATCH | `/subscriptions/mine/upgrade` | JWT | `{ plan: "FREE"\|"BASIC"\|"PREMIUM" }` | `200: { data, message }` |
| PATCH | `/subscriptions/mine/cancel` | JWT | — | `200: { data, message }` |
| GET | `/subscriptions/` | JWT + ADMIN | `?page&limit` | `200: { data, pagination }` |

---

## 3.11 Telegram — `/telegram`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| POST | `/telegram/link` | JWT | — | `200: { data: { code, expiresAt } }` o `{ linked, chatId }` |
| GET | `/telegram/link` | JWT | — | `200: { data: { linked, chatId?, code?, expiresAt? } }` |
| POST | `/telegram/unlink` | JWT | — | `200: { message }` |
| GET | `/telegram/device/:deviceId` | JWT | — | `200: { data: TelegramDeviceConfig }` |
| PATCH | `/telegram/device/:deviceId` | JWT | `{ enabled?, alertOnFault?, alertOnRange?, alertOnDisconnect?, alertOnSystem?, minSeverity? }` | `200: { data: TelegramDeviceConfig }` |
| POST | `/telegram/configure` | JWT + ADMIN | `{ token, username? }` | `200: { message }` |
| GET | `/telegram/bot-status` | JWT + ADMIN | — | `200: { running, username, lastError, ... }` |

---

## 3.12 Analytics — `/chambers`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| GET | `/chambers/:chamberId/analytics` | optionalAuth | — | `200: { data: { chamber, telemetry, vpd, risks, cycle, efficiency, ts } }` |

---

## 3.13 Eventos — `/events`

| Método | Ruta | Auth | Body/Params/Query | Respuesta |
|--------|------|------|-------------------|-----------|
| GET | `/events/` | optionalAuth | `?page&limit&type&deviceId&from&to` | `200: { data, pagination }` |
| GET | `/events/device/:deviceId` | optionalAuth | `?page&limit&type&from&to` | `200: { data, pagination }` |

---

## 3.14 Monitoreo — `/monitoring`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| GET | `/monitoring/metrics` | — | — | `200: { uptime, version, memory, db counts }` |
| GET | `/monitoring/health/db` | — | — | `200: { status: "ok" }` o `503` |

---

## 3.15 Diagnóstico — `/diag`

| Método | Ruta | Auth | Body/Params | Respuesta |
|--------|------|------|-------------|-----------|
| GET | `/diag/mqtt` | JWT | — | `200: { broker, ssrStates, controlModes }` |
| POST | `/diag/mqtt/publish` | JWT + ADMIN | `{ deviceId, topic?, payload? }` | `200: { message }` |

---

## 3.16 Endpoints de Sistema (No versionados)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | — | Health check general `{ status, uptime }` |
| GET | `/events` (SSE) | — | Server-Sent Events para streaming de telemetría, alarmas, estados. |

---

## 3.17 Chambers (no montado, pero implementado)

**Nota:** Este archivo existe pero NO está montado en el router. Si se desea reactivar:

| Método | Ruta | Auth | Body/Params | Descripción |
|--------|------|------|-------------|-------------|
| GET | `/chambers/` | JWT | — | Listar chambers con devices |
| GET | `/chambers/:id` | JWT | — | Ver chamber con devices |
| POST | `/chambers/` | JWT | `{ name, volume?, location? }` | Crear chamber |
| PATCH | `/chambers/:id` | JWT | `{ name?, volume?, location? }` | Editar chamber |
| DELETE | `/chambers/:id` | JWT + ADMIN | — | Eliminar chamber (si no tiene devices/cycles) |
| POST | `/chambers/migrate` | JWT + ADMIN | — | Ejecutar migración legacy |

---

## Resumen Estadístico

| Categoría | Cantidad |
|-----------|----------|
| Modelos/Entidades | 19 |
| Endpoints API activos | 63 |
| Endpoints Chambers (no montados) | 6 |
| Middlewares de infraestructura | 6 (auth, rbac, tenant, subscriptionRateLimit, checkDeviceAccess, rateLimit global) |
| Servicios background | 6 (controlEngine, mqttBridge, webSocket, thingSpeakSync, telegramService, dataRetentionJob) |
| Servicios de soporte | 4 (auditService, encryption, eventBus, logger) |
| Roles de usuario | 4 (SUPER_ADMIN, ADMIN, OPERATOR, VIEWER) |
| Planes de suscripción | 3 (FREE, BASIC, PREMIUM) |

---

*Documento generado el 11 de Julio de 2026. Backend versión 0.16.1.*
