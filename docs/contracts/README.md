# Contratos de Integración — Mush2

Los **Contratos** definen las interfaces de comunicación entre los distintos componentes del ecosistema Mush2. Especifican los formatos de intercambio de datos, protocolos, reglas de validación y responsabilidades de cada actor para garantizar la interoperabilidad del sistema.

Los contratos representan la **fuente de verdad** para cualquier implementación del firmware, backend, frontend o integraciones externas.

## ¿Cuándo crear un contrato?

Crea un documento de contrato cuando debas:

* Definir una API REST.
* Especificar un protocolo MQTT.
* Diseñar un servicio BLE.
* Documentar un protocolo de comunicación entre componentes.
* Versionar un formato de mensajes o eventos.
* Formalizar la interfaz pública entre dos sistemas.

**No** crees un contrato para:

* Decisiones de arquitectura (usa ADR).
* Modelado del dominio (usa DDD).
* Propuestas aún en discusión (usa RFC).
* Manuales de usuario o documentación operativa.

## Estructura del directorio

```text
docs/contracts/
├── README.md          # Este archivo
├── api-contract.md    # Contrato REST API
├── ble-contract.md    # Contrato BLE de Provisioning
└── mqtt-contract.md   # Contrato MQTT
```

## Índice de documentos

| Documento                         | Descripción                                                                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [API Contract](api-contract.md)   | Especificación de la API REST pública del backend, incluyendo autenticación, recursos, eventos, errores y versionado.          |
| [BLE Contract](ble-contract.md)   | Contrato del servicio Bluetooth Low Energy utilizado para el proceso de provisioning de dispositivos Mush2.                    |
| [MQTT Contract](mqtt-contract.md) | Contrato oficial del protocolo MQTT, tópicos, payloads, QoS, seguridad y reglas de interoperabilidad entre firmware y backend. |

## Versionado

* Cada contrato mantiene su propio esquema de versionado.
* Los cambios incompatibles deben incrementar la versión mayor (*major*).
* Los cambios compatibles pueden incrementar la versión menor (*minor*).
* Toda modificación debe mantener sincronizadas las implementaciones consumidoras del contrato.

## Relación con otros documentos

| Tipo    | Uso                                 | Los contratos no reemplazan                                             |
| ------- | ----------------------------------- | ----------------------------------------------------------------------- |
| **DDD** | Define el modelo de dominio         | Los contratos describen cómo se intercambia la información del dominio. |
| **ADR** | Registra decisiones arquitectónicas | Los contratos implementan las decisiones documentadas por los ADR.      |
| **RFC** | Debate y propuestas de cambios      | Los contratos documentan únicamente interfaces aprobadas y vigentes.    |
