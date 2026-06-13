# Mush2 — Controlador de Ambientes para Hongos Adaptógenos

Sistema IoT para monitoreo y control ambiental de cámaras de cultivo de hongos adaptógenos. Lee temperatura, humedad y CO2, controla actuadores SSR, y expone un dashboard web en tiempo real.

## Componentes

- **Firmware** (ESP8266) — Lectura de sensores AHT21/ENS160, control SSR, MQTT + ThingSpeak
- **Backend** (Node.js/Express) — API REST, PostgreSQL, motor de reglas, sincronización MQTT
- **Frontend** (React/Vite) — Dashboard en tiempo real, control remoto, visualización de datos

## Stack

| Capa | Tecnología |
|---|---|
| Firmware | C++ (PlatformIO / ESP8266) |
| Backend | Node.js 20 + Express 5 + Sequelize 6 |
| Frontend | React 18 + Vite + Chart.js |
| Base de datos | PostgreSQL 16 |
| Mensajería | MQTT 3.1.1 (Mosquitto/HiveMQ) |
| Telemetría (respaldo) | ThingSpeak |

## Documentación

- `PROJECT_CONTEXT.md` — Definición del proyecto
- `PROJECT_JOURNAL.md` — Bitácora de decisiones
- `docs/architecture/` — Arquitectura por componente
- `docs/protocol/protocol-v1.md` — Protocolo MQTT v1
- `docs/contracts/` — Contratos (MQTT, API REST)
- `docs/roadmap.md` — Roadmap de desarrollo
- `docs/requirements.md` — Requerimientos funcionales

## Licencia

MIT
