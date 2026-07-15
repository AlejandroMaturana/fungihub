# Documentación — Mush2

> Sistema IoT de control ambiental para hongos adaptógenos.
> Esta carpeta es el punto de entrada para toda la documentación técnica del proyecto.
> **Desplegado con VitePress en GitHub Pages**: https://alejandromaturana.github.io/mush2/

---

## ¿Por dónde empezar?

| Si eres... | Lee primero... |
|---|---|
| Colaborador nuevo | [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) → [`architecture/architecture.md`](architecture/architecture.md) → [`governance/contribution-guide.md`](governance/contribution-guide.md) |
| Agente IA | [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md) → [`contracts/`](contracts/) → ADR relevante al área de trabajo |
| Desarrollador firmware | [`architecture/firmware.md`](architecture/firmware.md) → [`protocol/protocol-v1.md`](protocol/protocol-v1.md) → [`ADR/ADR-014-OTA-v3.md`](ADR/ADR-014-OTA-v3.md) |
| Desarrollador backend | [`architecture/backend.md`](architecture/backend.md) → [`contracts/api-contract.md`](contracts/api-contract.md) → [`contracts/mqtt-contract.md`](contracts/mqtt-contract.md) |
| Desarrollador frontend | [`architecture/frontend.md`](architecture/frontend.md) → [`design/ui-standards.md`](design/ui-standards.md) |
| Operador / cultivador | [`user/manual.md`](user/manual.md) → [`operations/deployment.md`](operations/deployment.md) |

---

## Mapa de documentos

### 📐 Arquitectura (`architecture/`)
Describe **cómo están construidos** los componentes del sistema.

| Documento | Contenido |
|---|---|
| [`architecture.md`](architecture/architecture.md) | Visión general: diagrama de componentes, flujos de datos, stack tecnológico |
| [`backend.md`](architecture/backend.md) | Estructura backend: rutas, servicios, modelos, middleware |
| [`firmware.md`](architecture/firmware.md) | Arquitectura firmware ESP32-S3: módulos, tareas FreeRTOS, pinout, state machine |
| [`frontend.md`](architecture/frontend.md) | Árbol de componentes React, routing, SSE, diseño |
| [`database.md`](architecture/database.md) | Esquema PostgreSQL: entidades, relaciones, índices |
| [`capability-catalog.md`](architecture/capability-catalog.md) | Catálogo de capacidades, recursos, cuotas y políticas por plan |
| [`authorization-model.md`](architecture/authorization-model.md) | Modelo de autorización: autenticación dual, RBAC, capacidades, tenant scope |
| [`qos-policy.md`](architecture/qos-policy.md) | Políticas de calidad de servicio: frecuencias, protocolos, degradación |

### 🤝 Contratos (`contracts/`)
Define los **contratos de comunicación** entre componentes. Son inmutables sin incrementar versión.

| Documento | Contenido |
|---|---|
| [`api-contract.md`](contracts/api-contract.md) | Endpoints REST v1: request/response, autenticación, errores |
| [`mqtt-contract.md`](contracts/mqtt-contract.md) | Tópicos MQTT, payloads JSON, responsabilidades publisher/subscriber |

### 📡 Protocolo (`protocol/`)
Versionado independiente del protocolo HTTP de comunicación firmware ↔ backend.

| Documento | Contenido |
|---|---|
| [`protocol-v1.md`](protocol/protocol-v1.md) | Especificación completa del protocolo HTTP polling v1 |
| [`compatibility-matrix.md`](protocol/compatibility-matrix.md) | Matriz de compatibilidad firmware ↔ backend ↔ protocolo |
| [`VERSION`](protocol/VERSION) | Versión actual del protocolo |

### 🏛️ Decisiones de Diseño (`ADR/`)
Registro de **decisiones de arquitectura** tomadas y su justificación. Una vez aceptado, un ADR es inmutable.

| Documento | Contenido |
|---|---|
| [`ADR-001-ESP32.md`](ADR/ADR-001-ESP32.md) | Selección de plataforma ESP32-S3 |
| [`ADR-002-AHT21-ENS160-sensors.md`](ADR/ADR-002-AHT21-ENS160-sensors.md) | Sensores de temperatura/humedad y calidad de aire |
| [`ADR-003-SSR-low-level-04ch.md`](ADR/ADR-003-SSR-low-level-04ch.md) | Módulo SSR de 4 canales de bajo nivel |
| [`ADR-004-ThingSpeak.md`](ADR/ADR-004-ThingSpeak.md) | Integración con ThingSpeak para monitoreo |
| [`ADR-005-PostgreSQL-SequelizeORM.md`](ADR/ADR-005-PostgreSQL-SequelizeORM.md) | Base de datos PostgreSQL con Sequelize ORM |
| [`ADR-006-Logs-Monitoreo-estrategia.md`](ADR/ADR-006-Logs-Monitoreo-estrategia.md) | Estrategia de logs y monitoreo |
| [`ADR-007-JWT-RBAC.md`](ADR/ADR-007-JWT-RBAC.md) | Autenticación JWT y control de acceso RBAC |
| [`ADR-008-HTTP-Command-Protocol.md`](ADR/ADR-008-HTTP-Command-Protocol.md) | Protocolo de comandos HTTP |
| [`ADR-009-Estrategia-Control-Histeresis-Fuzzy.md`](ADR/ADR-009-Estrategia-Control-Histeresis-Fuzzy.md) | Control por histéresis y lógica difusa |
| [`ADR-010-Mecanismo-Fail-Safe-Overheat.md`](ADR/ADR-010-Mecanismo-Fail-Safe-Overheat.md) | Mecanismo fail-safe para sobrecalentamiento |
| [`ADR-011-Automatizacion-por-Etapas-Recipes.md`](ADR/ADR-011-Automatizacion-por-Etapas-Recipes.md) | Automatización por etapas y recetas |
| [`ADR-012-FreeRTOS.md`](ADR/ADR-012-FreeRTOS.md) | Uso de FreeRTOS en firmware |
| [`ADR-013-Seguridad-Estrategia.md`](ADR/ADR-013-Seguridad-Estrategia.md) | Estrategia de seguridad general |
| [`ADR-014-OTA-v3.md`](ADR/ADR-014-OTA-v3.md) | Sistema OTA versión 3 |
| [`ADR-015-docs-restructure.md`](ADR/ADR-015-docs-restructure.md) | Reestructuración de documentación |
| [`ADR-016-capability-based-subscription.md`](ADR/ADR-016-capability-based-subscription.md) | Política de capacidades basada en suscripción |
| [`ADR-017-Event-Bus.md`](ADR/ADR-017-Event-Bus.md) | Implementación de Event Bus |

### 🧩 Engineering Design Documents (`EDD/`)
Documentos de **diseño de alto nivel** para subsistemas complejos. Se crean _antes_ de implementar.

| Documento | Contenido |
|---|---|
| [`EDD-001-sistema-control-ambiental.md`](EDD/EDD-001-sistema-control-ambiental.md) | Sistema de control ambiental end-to-end |
| [`EDD-002-motor-reglas-recetas.md`](EDD/EDD-002-motor-reglas-recetas.md) | Motor de reglas y recetas de cultivo |
| [`EDD-003-ota-v3-canary-deployment.md`](EDD/EDD-003-ota-v3-canary-deployment.md) | OTA v3 con canary deployment |
| [`EDD-004-estrategia-multitenant.md`](EDD/EDD-004-estrategia-multitenant.md) | Estrategia multi-tenant y escalabilidad |
| [`EDD-005-BLE-provisioning.md`](EDD/EDD-005-BLE-provisioning.md) | BLE Provisioning — configuración inicial por Bluetooth |

### 💬 Propuestas (RFC) (`RFC/`)
**Request for Comments** — propuestas formales para cambios significativos antes de decidir.

| Documento | Estado | Contenido |
|---|---|---|
| [`RFC-template.md`](RFC/RFC-template.md) | TEMPLATE | Plantilla base para nuevas RFCs |
| [`RFC-0001-https-tls-firmware.md`](RFC/RFC-0001-https-tls-firmware.md) | DRAFT | HTTPS/TLS en firmware (WiFiClientSecure) |
| [`RFC-0002-mqtt-v2-upgrade.md`](RFC/RFC-0002-mqtt-v2-upgrade.md) | DRAFT | Migración protocolo MQTT a v2 |
| [`RFC-0003-multi-device-dashboard.md`](RFC/RFC-0003-multi-device-dashboard.md) | DRAFT | Dashboard multi-dispositivo simultáneo |
| [`RFC-0004-notificaciones-push.md`](RFC/RFC-0004-notificaciones-push.md) | DRAFT | Sistema de notificaciones push |
| [`RFC-0005-BLE-Provisioning-&-Device-Bootstrap.md`](RFC/RFC-0005-BLE-Provisioning-&-Device-Bootstrap.md) | ACCEPTED | BLE Provisioning & Device Bootstrap |
| [`RFC-0006-realtime-streaming.md`](RFC/RFC-0006-realtime-streaming.md) | DRAFT | Real-Time Streaming y QoS |
| [`RFC-0007-device-limits.md`](RFC/RFC-0007-device-limits.md) | DRAFT | Límites de dispositivos por plan |
| [`RFC-0008-button-interaction.md`](RFC/RFC-0008-button-interaction.md) | DRAFT | Interacción con botones físicos |

### 🎨 Diseño (`design/`)
Lineamientos visuales, design tokens y decisiones de UX.

| Documento | Contenido |
|---|---|
| [`ui-standards.md`](design/ui-standards.md) | Sistema de diseño: tokens, tipografía, colores, componentes |

### 📋 Gobernanza (`governance/`)
Normas y procesos para contribuir al proyecto de forma consistente.

| Documento | Contenido |
|---|---|
| [`contribution-guide.md`](governance/contribution-guide.md) | Flujo de trabajo completo para contribuidores |
| [`coding-standards.md`](governance/coding-standards.md) | Estándares de código por componente |
| [`branching-strategy.md`](governance/branching-strategy.md) | Estrategia de branches y nomenclatura |
| [`definition-of-done.md`](governance/definition-of-done.md) | Criterios de aceptación para toda tarea |
| [`tech-debt.md`](governance/tech-debt.md) | Registro centralizado de deuda técnica |
| [`versioning.md`](governance/versioning.md) | SemVer por componente |

### 🗺️ Roadmap (`roadmap/`)
Planificación estratégica del proyecto.

| Documento | Contenido |
|---|---|
| [`roadmap.md`](roadmap/roadmap.md) | **Fuente única de verdad**: fases 0–18, dependencias, skills |
| [`milestone.md`](roadmap/milestone.md) | Detalle de milestones completados con criterios de aceptación |
| `archive/` | Roadmaps específicos históricos (frontend, OTA, consolidación) |

### ⚙️ Operaciones (`operations/`)
Procedimientos de despliegue y operación del sistema.

| Documento | Contenido |
|---|---|
| [`deployment.md`](operations/deployment.md) | Entornos, instrucciones de despliegue, CI/CD |

### 📊 Diagramas (`diagrams/`)
Diagramas de arquitectura visual.

| Diagrama | Contenido |
|---|---|
| `architecture.drawio` | Diagrama de componentes del sistema |
| `database.drawio` | Esquema de base de datos con relaciones |
| `sequence.drawio` | Diagramas de secuencia de flujos críticos |
| `state_machine.drawio` | Máquina de estados del firmware |
| `exports/` | Imágenes exportadas (PNG/SVG) para visualización en GitHub |

### 👤 Usuario (`user/`)
Documentación para operadores y cultivadores.

| Documento | Contenido |
|---|---|
| [`manual.md`](user/manual.md) | Manual de usuario completo |

### 🧠 Domain-Driven Design (`DDD/`)
Lineamientos y contexto del diseño orientado al dominio del sistema.

| Documento | Contenido |
|---|---|
| [`DDD-001-domain-model.md`](DDD/DDD-001-domain-model.md) | Modelo de dominio del sistema |
| [`DDD-002-bounded-contexts.md`](DDD/DDD-002-bounded-contexts.md) | Contextos delimitados |
| [`DDD-003-agregados-raices-de.md`](DDD/DDD-003-agregados-raices-de.md) | Agregados y raíces de agregado |
| [`DDD-004-value-objets.md`](DDD/DDD-004-value-objets.md) | Objetos de valor |
| [`DDD-005-state-machines.md`](DDD/DDD-005-state-machines.md) | Máquinas de estados de dominio |
| [`DDD-006-domain-event.md`](DDD/DDD-006-domain-event.md) | Eventos de dominio |
| [`DDD-007-migration-roadmap.md`](DDD/DDD-007-migration-roadmap.md) | Roadmap de migración a DDD |

### 📐 Otros documentos en raíz

| Documento | Contenido |
|---|---|
| [`requirements.md`](requirements.md) | Requerimientos funcionales y no funcionales (con estado de implementación) |
| [`scalability.md`](scalability.md) | Guía de escalabilidad: Nivel 1 (dev) → Nivel 5 (miles de dispositivos) |
| [`operations.md`](operations.md) | Guía de operaciones del sistema |

---

## Estado de la documentación

| Sección | Estado | Última actualización |
|---|---|---|---|
| `architecture/` | ✅ Completo (8 docs) | 2026-07-15 |
| `contracts/` | ✅ Completo (2 docs) | 2026-07-15 |
| `protocol/` | ✅ Completo (2 docs + VERSION) | 2026-07-15 |
| `ADR/` | ✅ 17 ADRs (001–017) | 2026-07-15 |
| `EDD/` | ✅ 5 EDDs | 2026-07-15 |
| `RFC/` | ✅ 8 RFCs (0001–0008) | 2026-07-15 |
| `DDD/` | ✅ 7 documentos DDD | 2026-07-15 |
| `design/` | ✅ Completo (1 doc) | 2026-07-15 |
| `governance/` | ✅ Completo (6 docs) | 2026-07-15 |
| `roadmap/` | ✅ Consolidado (2 docs + archive) | 2026-07-15 |
| `diagrams/` | ✅ Disponible (5 diagramas) | 2026-07-15 |
| `operations/` | ✅ Completo (1 doc) | 2026-07-15 |
| `user/` | ✅ Manual completo (1 doc) | 2026-07-15 |
| Raíz | ✅ 3 documentos | 2026-07-15 |

---

## Reglas de documentación

1. **Un archivo = una responsabilidad**: No mezclar arquitectura con operaciones.
2. **Cambio de contrato = nueva versión**: Protocolo HTTP y contratos MQTT tienen versionado independiente.
3. **ADR es inmutable**: Una vez aceptado, un ADR no se modifica; se crea uno nuevo que lo reemplaza.
4. **RFC antes de implementar**: Todo cambio de protocolo, seguridad o arquitectura requiere RFC aprobado.
5. **EDD antes de diseñar**: Sistemas complejos requieren EDD revisado antes de escribir código.
6. **CHANGELOG.md siempre**: Todo merge a `main` o `develop` requiere entrada en CHANGELOG.
