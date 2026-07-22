# Roadmap — Mush2

> Actualizado: 2026-07-22 — Mush2 v1.7.18 — Fases 0-8 completadas, Refundación Domain-First en curso

El orden de las fases minimiza retrabajo: primero se fijan contratos, luego se construyen slices verticales completos, después se endurece y finalmente se industrializa. Tras la refundación (ADR-019 a ADR-022), el foco está en reescribir el backend siguiendo arquitectura domain-first antes de añadir nuevas capacidades.

---

## FASE 0 — Definición y Contratos (COMPLETADA ✅)

- [x] `docs/protocol/protocol-v1.md` — Contrato MQTT: tópicos, payloads, QoS
- [x] `docs/contracts/mqtt-contract.md` — Responsabilidades MQTT
- [x] `docs/contracts/api-contract.md` — Endpoints REST
- [x] `docs/architecture/architecture.md` — Arquitectura general
- [x] `docs/architecture/backend.md` — Estructura backend
- [x] `docs/architecture/frontend.md` — Árbol React, routing, SSE
- [x] `docs/architecture/firmware.md` — Módulos, pinout, state machine
- [x] `docs/database.md` — Esquema DB
- [x] `docs/requirements.md` — Requerimientos
- [x] `docs/ADR/ADR-001-thingspeak.md` — ThingSpeak como respaldo
- [x] `docs/governance/versioning.md` — SemVer por componente

---

## FASE 1 — Cadena de Telemetría (COMPLETADA ✅)

```
[Sensor] → [Firmware] → MQTT → [Backend] → REST → [Frontend]
```

- [x] Firmware: WiFi, AHT21, MQTT publisher, config.h generado
- [x] Backend: Express 5 + Sequelize + PostgreSQL, suscripción MQTT, endpoints telemetría
- [x] Frontend: Vite + React Router, Dashboard con MetricCard
- [x] Protocolo MQTT v1.0.0 validado extremo a extremo

---

## FASE 2 — Bucle de Control (COMPLETADA ✅)

```
[SSR] ← [Firmware] ← MQTT ← [Backend] ← REST ← [Frontend]
```

- [x] Firmware: SSR 3 canales, suscripción comandos MQTT, ACK
- [x] Backend: modelo Actuator, PATCH actuator, publishCommand, SSE
- [x] Frontend: DeviceDetail con ActuatorControl, useSSE hook

---

## FASE 3 — Sensores Avanzados (COMPLETADA ✅)

- [x] Firmware: ENS160 (CO2/VOC/AQI) en bus I2C compartido
- [x] Backend: ThingSpeak sync, modelos Recipe/CultivationCycle/CycleState
- [x] Seed: receta Melena de León

---

## FASE 4 — Automatización (COMPLETADA ✅)

- [x] Firmware: histéresis T/H/CO2, modos LOCAL/REMOTE/OFF, alarmas
- [x] Backend: controlEngine.js, transición automática de fases, snapshots
- [x] Frontend: página Ciclos, panel de alarmas en Dashboard

---

## FASE 5 — Hardening (COMPLETADA ✅)

- [x] Firmware: state machine (8 estados), watchdog HW+SW, EEPROM, MQTT backoff + LWT
- [x] Backend: JWT auth + RBAC, rate limiting, Helmet CSP, audit logging, tests
- [x] Frontend: ErrorBoundary, Skeleton, AuthContext, responsive

---

## FASE 6 — Multiusuario (COMPLETADA ✅)

- [x] Backend: tenant middleware, UserChamberAccess, checkDeviceAccess
- [x] Frontend: login/logout, axios interceptors, rutas protegidas

---

## FASE 7 — Producción (COMPLETADA ✅)

- [x] Firmware: OTA (ArduinoOTA + HTTP Update vía MQTT)
- [x] Backend: metrics endpoint, health checks, backup script
- [x] CI/CD: GitHub Actions (firmware + backend + frontend)
- [x] Documentación: manual de usuario

---

## FASE 7b — Resiliencia del Firmware (COMPLETADA ✅)

**Objetivo**: Convertir el firmware en un dispositivo embebido resiliente capaz de auto-recuperación, actualizaciones remotas y operación continua sin intervención. Reducir el acoplamiento entre módulos y agregar observabilidad interna.

**Skills**: `embedded-systems`, `iot-firmware`

### Entregables
- [x] Event Bus in-memory: `event_bus.h/.cpp` — FreeRTOS Queue, 10 tipos de evento, 4 suscriptores por tipo, `publishFromISR()`
- [x] Logger multi-sink: `logger.h/.cpp` — Serial, SPIFFS (auto-rotación 64KB), MQTT; ring buffer 64 entries; macros `LOG_E/W/I/D/V`
- [x] Health Monitor: `health_monitor.h/.cpp` — 7ma tarea FreeRTOS, checks cada 5 min (heap, task stacks, I2C, AHT21/ENS160 presence)
- [x] Telemetry Buffer: `telemetry_buffer.h/.cpp` — RAM ring (200 entries) + SPIFFS spill, replay on reconnect
- [x] Sensor fallback fix: usa `lastValidTemp/Hum` en vez de lectura inválida
- [x] State machine: transiciones PROVISIONING→WIFI y OTA_UPDATING→NORMAL, persistencia NVS
- [x] Setpoint persistence: `saveSetpointsNVS()`/`loadSetpointsNVS()` en HysteresisController
- [x] OTA SHA-256 verification: mbedtls en ota_executor
- [x] Self-test mejorado: boot (~2s) + HealthMonitor periódico (comprehensive)
- [x] Extern decoupling: `init(StateMachine*)` / `init(SSRController*)` en OTA modules
- [x] Tareas extraídas: `tasks.h/.cpp` — main.ino reducido de 944→223 líneas
- [x] ADR-017: Event Bus architecture decision documentado

### Impacto
- RAM: ~6KB adicional (38%→~44%)
- Flash: ~20KB adicional (34%→~38%)
- 6 nuevos módulos de código fuente

**Referencias**: `docs/ADR/ADR-017-Event-Bus.md`

---

## FASE 7c — Debt Técnico / Quick Wins (COMPLETADA ✅)

**Objetivo**: Corregir bugs bloqueantes, eliminar código duplicado, agregar NTP, y mejorar la robustez del firmware con cambios de bajo riesgo y alto impacto.

**Audit source**: Auditoría técnica completa de 48 archivos fuente, 5 niveles de prioridad (bloqueante → feature).

### Entregables
- [x] **1.1 Fix `delay(80)` en AHT21**: `delay(80)` → `vTaskDelay(pdMS_TO_TICKS(80))` en `aht_sensor.cpp:63`. Elimina bloqueo de 80ms en Core 1 que causaba timeouts TWDT.
- [x] **1.2 Eliminar `systemState` char[16]**: Reemplazado por `volatile bool sensorFailed` + `sm.getState()`. Eliminada fuente de verdad paralela. 6 puntos de reemplazo en `tasks.cpp`.
- [x] **1.3 Fix fallback loop infinito**: El fallback de sensores se re-activaba indefinidamente con datos obsoletos. Ahora `lastSensorValid = 0` al expirar + chequeo de antigüedad máxima (10 min).
- [x] **1.4 NTP background sync**: `configTime(0, 0, "pool.ntp.org")` no bloqueante. Timestamps reales disponibles ~5s después de WiFi connect. Helper `getTimestamp()` en `tasks.cpp`.
- [x] **1.5 Atomicidad `_pendingCount` en EventBus**: `portENTER_CRITICAL`/`portEXIT_CRITICAL` con `portMUX_TYPE _spinlock` para operaciones de increment/decrement desde ISR y tareas.

### Build result
- RAM: 26.5% (86,916 / 327,680 bytes)
- Flash: 41.2% (1,564,577 / 3,801,088 bytes)
- Sin errores de compilación, warnings preexistentes sin cambios

---

## FASE 7d — Robustez del Firmware (COMPLETADA ✅)

**Objetivo**: Endurecer el firmware con mecanismos de auto-recuperación, monitoreo por tarea, y prevención de fallos silenciosos. Cada tarea reporta salud, el bus I2C se recupera automáticamente, y las ventanas de tiempo evitan wraparound.

### Entregables
- [x] **2.1 Per-task heartbeat + HealthMonitor**: `HeartbeatTaskId` enum (7 tareas), `HealthMonitor::feed(taskId)` called cada loop, `_checkHeartbeats()` con timeout 30s, `staleTaskMask` bitmask en métricas.
- [x] **2.2 Fix `loadRebootCount()`**: Solo incrementa en boot anormal. Boots normales loguean sin incrementar.
- [x] **2.3 OTA partition confirmation**: `esp_ota_mark_app_valid_cancel_rollback()` en cada boot normal.
- [x] **2.4 I2C bus recovery**: `_recoverI2C()` en HealthMonitor: pulso 9-clock en SCL + `Wire.end()`/`Wire.begin()`.
- [x] **2.5 NVS namespace separation**: SSR cambia de `"mush2"` a `"mush2_ssr"` (`SSR_NVS_NS`).
- [x] **2.6 `millis()` → `esp_timer` para hold window**: `lastActuatorPersist` cambiado a `volatile int64_t` (microsegundos via `esp_timer_get_time()`).

### Build result
- RAM: 26.5% (86,948 / 327,680 bytes) — estable
- Flash: 41.2% (1,565,629 / 3,801,088 bytes) — estable

---

## FASE 7e — Estabilización Funcional (COMPLETADA ✅)

**Objetivo**: Eliminar inconsistencias entre firmware, backend, base de datos y frontend. Garantizar que la información operacional represente fielmente el estado real del hardware.

**ADR**: `docs/ADR/ADR-018-functional-integrity-stabilization.md`

### Firmware (v0.21.0)
- [x] `millis()` → `getTimestamp()` en 5 payloads MQTT
- [x] Unificar mensaje de connect con `publishStatus()`

### Backend (v0.23.0)
- [x] Mapear firmware state → Device.status
- [x] Campos `controlMode` y `lastFirmwareState` en Device
- [x] Almacenar `aqi` del ENS160 en telemetry
- [x] Enviar `setpoints` y `phase` en comandos MQTT
- [x] Fix SSE connected message
- [x] Forward `health`, `maintenance`, `phase_transition` vía SSE
- [x] DELETE cascade para Device
- [x] Persistir sensorHistory del phaseEvaluator en DB

### Frontend (v1.10.0)
- [x] Null telemetry → gaps en charts
- [x] Stale values con indicador visual
- [x] Rangos de sensores desde receta activa
- [x] Datos de suscripción reales del backend

---

## FASE 8 — Multi-Cámara Física (COMPLETADA ✅)

**Objetivo**: Escalar de un nodo de prueba a N cámaras físicas simultáneas con firmware idéntico, cada una con receta independiente.

**Fecha completado**: 2026-06-24 (v0.8.0)

### Entregables
- [x] Firmware: `deviceId` dinámico derivado de MAC address, grabado en EEPROM al primer boot
- [x] Firmware: todos los mensajes MQTT usan el deviceId real
- [x] Firmware: cada nodo filtra comandos por su propio deviceId
- [x] Backend: auto-registro de nodos al recibir primer mensaje (findOrCreate por deviceId)
- [x] Frontend: vista multi-cámara con selector de dispositivo
- [x] Frontend: Dashboard con métrica agregada (promedio de T°/HR entre cámaras activas)

---

## FASE 9 — Refundación Domain-First (EN PROGRESO 🔄)

**Objetivo**: Reescribir el backend siguiendo arquitectura domain-first (ADR-019). El dominio se modela primero con cero dependencias de infraestructura. La capa de persistencia, API y servicios se construye después sobre el dominio validado.

**ADR**: `docs/ADR/ADR-019-domain-first.md`

**Decisiones clave**:
- **ADR-020**: `Run` reemplaza `CultivationCycle` como entidad central de ejecución
- **ADR-021**: Control Engine se descompone en orquestador + sub-servicios especializados
- **ADR-022**: HistoryService reconstruye la línea temporal completa de un Run

**Skills**: `backend-engineer`, `context-manager`, `state-machine-design`

### Paquete @mush2/domain (prioritario)
- [ ] Definir entidades puras: `Run`, `Chamber`, `Recipe`, `Telemetry`, `Alarm`
- [ ] Definir value objects: `TemperatureRange`, `HumidityRange`, `CO2Target`, `Phase`
- [ ] Definir domain events: `RunStarted`, `RunAborted`, `PhaseTransitioned`, `AlarmRaised`
- [ ] Definir repository interfaces (sin implementación)
- [ ] Tests unitarios del dominio (sin DB ni HTTP)

### Paquete @mush2/application
- [ ] Use cases: `StartRun`, `AbortRun`, `IngestTelemetry`, `EvaluateRun`
- [ ] Orchestration: llamar domain services + publicar events

### Paquete @mush2/control-engine
- [ ] `PhaseEvaluator` (transiciones por reglas de especie)
- [ ] `ActuatorComputer` (histéresis por canal)
- [ ] `SafetyGuard` (fail-safe: temp > 32°C)
- [ ] `AlarmService` (deduplicación, generación, resolución)

### Backend (ensamblaje)
- [ ] Persistencia: implementar repositories sobre Sequelize/PostgreSQL
- [ ] API: traducir endpoints existentes a use cases
- [ ] MQTT bridge: mantener compatibilidad con firmware actual
- [ ] Migración: mapear modelos actuales a nueva estructura sin perder datos

### Criterios de aceptación
- [ ] El paquete `@mush2/domain` compila y pasa tests sin importar infraestructura
- [ ] Un use case como `StartRun` se puede testear con un repository mock
- [ ] El Control Engine delega a sub-servicios (PhaseEvaluator, ActuatorComputer, SafetyGuard)
- [ ] HistoryService reconstruye timeline completa desde RunState + PhaseTransition + Alarm
- [ ] El backend existente sigue funcionando durante la migración (no big-bang)

**Referencias**: `docs/ADR/ADR-019-domain-first.md`, `docs/ADR/ADR-020-run-replaces-cultivationcycle.md`, `docs/ADR/ADR-021-control-engine-as-orchestrator.md`, `docs/ADR/ADR-022-history-as-active-service.md`, `docs/architecture/engineering-architecture.md`, `docs/architecture/mvp.md`

---

## FASE 10 — Infraestructura MQTT Propia + TLS

**Objetivo**: Eliminar dependencia de brokers públicos (test.mosquitto.org, broker.hivemq.com). Comunicación cifrada entre firmware y backend con control total sobre disponibilidad y tópicos.

**Skills**: `devops-engineer`, `mqtt-development`, `backend-engineer`

### Entregables
- [ ] Infraestructura: Mosquitto en contenedor Docker con persistencia en disco
- [ ] Infraestructura: certificados TLS (Let's Encrypt o autofirmados) para MQTT
- [ ] Firmware: soporte TLS en ESP32-S3 vía `WiFiClientSecure` con huella SHA256
- [ ] Firmware: conexión a broker propio en puerto 8883 con validación de certificado
- [ ] Backend: conexión MQTT con TLS al broker propio
- [ ] Backend: autenticación MQTT por usuario/contraseña (no anónimo)
- [ ] Protocolo: `docs/protocol/protocol-v2.md` con TLS como requisito recomendado
- [ ] ADR: redactar ADR-023 (Broker MQTT propio)

### Criterios de aceptación
- [ ] Wireshark no muestra datos en texto plano entre ESP32-S3 y broker
- [ ] El broker propio tiene uptime >99% en una semana de prueba
- [ ] La migración de broker público a propio se hace con un cambio de config, sin recompilar firmware

**Depende de**: Fase 9 (la nueva arquitectura facilita el cambio de broker)

---

## FASE 11 — Observabilidad y Alertas

**Objetivo**: Visibilidad completa del sistema en producción. Logs estructurados, métricas en tiempo real, alertas proactivas y notificaciones.

**Skills**: `observability-engineer`, `backend-engineer`

### Entregables
- [ ] Backend: logging estructurado con Pino (reemplazar `console.log` disperso)
- [ ] Backend: endpoint `GET /monitoring/logs` con filtros por nivel/componente
- [ ] Backend: notificaciones por email (alarmas CRITICAL + WARNING) vía nodemailer
- [ ] Backend: health check por nodo (última telemetría, estado MQTT, watchdog)
- [ ] Firmware: ADR-024-Mecanismo-Fail-Safe-Overheat redactado e implementado
- [ ] Frontend: página `/monitoring` con estado de salud del sistema
- [ ] Docs: `docs/operations/monitoring.md` — Guía de monitoreo y alertas

### Criterios de aceptación
- [ ] Una alarma CRITICAL se notifica por email en < 60s
- [ ] El panel de salud muestra el estado de todos los nodos en < 2s
- [ ] El firmware reporta heap libre y causa del último reinicio en cada telemetría

**Depende de**: Fase 9 (logging integrado en la nueva arquitectura)

---

## FASE 12 — Biblioteca de Especies y Recetas

**Objetivo**: Poblar el sistema con las 7 especies de hongos adaptógenos como datos de producción. Cada especie tiene perfil biológico y al menos una receta validada con parámetros reales.

**Skills**: `backend-engineer`, `technical-writer`

### Entregables
- [ ] Base de datos: seeders de producción con las 7 especies
- [ ] Backend: endpoint `GET /api/species` con filtros por `adapterClass`, `originClimate`, `difficultyLevel`
- [ ] Backend: endpoint `POST /api/recipes/:id/deprecate` para ciclo de vida de recetas
- [ ] Frontend: página "Biblioteca de Especies" con fichas visuales
- [ ] Frontend: comparador de recetas lado a lado

### Criterios de aceptación
- [ ] Las 7 especies existen como datos de migración (no seeders volátiles)
- [ ] Un operador puede ver la ficha de Reishi y entender sus parámetros

**Depende de**: Fase 9 (modelos de dominio actualizados)

---

## FASE 13 — Automatización Adaptativa por Fase

**Objetivo**: Transiciones de fase basadas en condiciones de sensores, no solo tiempo. El sistema decide cuándo pasar de INCUBATION a FRUITING basándose en datos reales.

**Skills**: `state-machine-design`, `backend-engineer`, `embedded-systems`

### Entregables
- [ ] Backend: `PhaseTransitionEvaluator` con reglas por especie
- [ ] Backend: modo "semi-automático" (sugiere transición, operador aprueba)
- [ ] Backend: histéresis mejorada (ancho de banda configurable por canal)
- [ ] Firmware: setpoints dinámicos por canal
- [ ] ADR: ADR-025-Automatizacion-por-Etapas
- [ ] Frontend: notificación + botón "Aprobar transición"

### Criterios de aceptación
- [ ] Shiitake pasa a FRUITING automáticamente tras condiciones de CO₂/humedad
- [ ] El operador puede ajustar histéresis desde el frontend

**Depende de**: Fase 9 (nuevo PhaseEvaluator), Fase 12 (datos de especies)

---

## FASE 14 — Endurecimiento (E2E + CI/CD + Calidad)

**Objetivo**: Pruebas end-to-end, CI/CD completo, cobertura de tests y ADRs pendientes cerrados.

**Skills**: `devops-engineer`, `test-driven-development`, `technical-writer`

### Entregables
- [ ] Backend: tests E2E con Playwright (flujo: login → dashboard → comando → ACK)
- [ ] Backend: tests de integración MQTT con broker mock
- [ ] CI/CD: workflows completos para firmware + backend + frontend
- [ ] CI/CD: badge de cobertura en README
- [ ] Base de datos: estrategia de retención de telemetría (raw 30d, agregados 1 año)
- [ ] ADRs pendientes: ADR-024 (Fail-Safe), ADR-025 (Automatización), ADR-026 (Histeresis)

### Criterios de aceptación
- [ ] CI reporta en < 5 min para backend/frontend, < 15 min para firmware
- [ ] Cobertura de tests del backend > 70%
- [ ] Los ADRs pendientes están redactados y cerrados

**Depende de**: Fases 9-13 (código estable para testear)

---

## Fases de Visión (Post-MVP)

Las siguientes fases representan la visión a largo plazo del proyecto. Se activarán cuando las fases anteriores estén consolidadas y haya demanda real de usuario.

### FASE 15 — Trazabilidad de Compuestos Bioactivos
- [ ] Modelo `BioactiveProfile` vinculado a `Run`
- [ ] Correlación automática ambiente → compuestos
- [ ] Dashboard de dispersión y comparación entre ciclos
- **Diferenciador competitivo del proyecto**

### FASE 16 — Gemelo Digital del Cultivo
- [ ] `DigitalTwinEngine`: simulación de ciclo completo antes de inocular
- [ ] Recalibración con datos reales del ciclo en curso
- [ ] Interfaz de predicción con slider de tiempo

### FASE 17 — Marketplace de Recetas Comunitarias
- [ ] Fork, rate y compartir recetas
- [ ] Métricas de éxito por receta (tasa de éxito, rendimiento)

### FASE 18 — Aplicación Móvil de Monitoreo
- [ ] PWA/React Native con notificaciones push
- [ ] Vista rápida de estado de cámaras + acciones rápidas

### FASE 19 — Certificación y Trazabilidad Regulatoria
- [ ] Generación de certificados PDF por lote
- [ ] Trazabilidad para certificación orgánica/exportación

---

## Resumen

| Fase | Entrega | Dependencia | Estado |
|---|---|---|---|
| 0. Contratos | Documentación, contratos, arquitectura | — | ✅ |
| 1. Cadena Telemetría | Sensor → MQTT → Backend → DB → Frontend | Fase 0 | ✅ |
| 2. Bucle de Control | Frontend → API → MQTT → SSR → ACK | Fase 1 | ✅ |
| 3. Sensores Avanzados | ENS160, ThingSpeak, recetas | Fase 1 | ✅ |
| 4. Automatización | Reglas, ciclos, alarmas | Fases 2+3 | ✅ |
| 5. Hardening | Seguridad, errores, tests, watchdog | Fase 0-4 | ✅ |
| 6. Multiusuario | Múltiples usuarios, tenencia | Fase 5 | ✅ |
| 7. Producción | OTA, CI/CD, monitoreo, docs | Fase 0-6 | ✅ |
| 7b-7e. Firmware + Estabilización | Resiliencia, debt, robustez, integridad | Fase 7 | ✅ |
| 8. Multi-Cámara | N nodos simultáneos, dashboard multi-dispositivo | Fase 7e | ✅ |
| **9. Refundación Domain-First** | **Reescritura backend con arquitectura domain-first** | **Fase 8** | **🔄** |
| 10. MQTT Propio + TLS | Broker propio, comunicación cifrada | Fase 9 | 🔲 |
| 11. Observabilidad | Logs estructurados, alertas, notificaciones | Fase 9 | 🔲 |
| 12. Especies y Recetas | Biblioteca de 7 especies, recetas de producción | Fase 9 | 🔲 |
| 13. Automatización Adaptativa | Transiciones por sensor, histéresis por canal | Fases 9+12 | 🔲 |
| 14. Endurecimiento | E2E, CI/CD completo, ADRs pendientes | Fases 9-13 | 🔲 |
| 15-19. Visión | Bioactivos, gemelo digital, marketplace, móvil, certificación | Post-MVP | 💡 |
