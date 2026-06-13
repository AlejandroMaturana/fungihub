# Base de Datos — Mush2

## Motor

PostgreSQL 18, ORM Sequelize 6.

## Entidades y Relaciones

```
Device ──1:N── Sensor
  ├──1:N── Actuator
  ├──1:N── Telemetry
  └──1:N── Event

User ──1:N── AuditLog
  └──N:M── Device (via UserChamberAccess)

Recipe ──1:N── CultivationCycle
                └──1:N── CycleState
```

## Modelos

### Device
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| deviceId | VARCHAR(50) UNIQUE | ID del dispositivo (ej: esp8266_001) |
| macAddress | VARCHAR(17) | MAC del ESP8266 |
| userId | UUID FK(user) | Propietario (nullable = legacy) |
| chamberName | VARCHAR(100) | Nombre de la cámara |
| chamberLocation | VARCHAR(200) | Ubicación |
| firmwareVersion | VARCHAR(20) | Versión actual |
| status | ENUM(ONLINE,OFFLINE,ERROR) | Estado |
| lastSeen | TIMESTAMP | Última conexión |
| thingSpeakChannelId | VARCHAR(64) | Channel ID ThingSpeak |
| thingSpeakReadKey | TEXT | Read key cifrada (AES-256-GCM) |

### Sensor
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| deviceId | UUID FK(device) | Dispositivo padre |
| type | ENUM(TEMPERATURE,HUMIDITY,CO2,VOC) | Tipo de sensor |

### Actuator
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| deviceId | UUID FK(device) | Dispositivo padre |
| channel | INTEGER | Canal SSR (1-3) |
| state | ENUM(ON,OFF) | Estado actual |
| mode | ENUM(LOCAL,REMOTE,OFF) | Modo de control |
| lastCommand | VARCHAR(50) | Último cmdId |
| lastSeen | TIMESTAMP | Última actualización |
| lastAck | VARCHAR(20) | Último estado ACK |

### Telemetry
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| deviceId | UUID FK(device) | Dispositivo |
| sensorId | UUID FK(sensor) | Sensor |
| value | DECIMAL(8,2) | Valor leído |
| sensorType | ENUM(TEMPERATURE,HUMIDITY,CO2,VOC) | Tipo |
| unit | VARCHAR(10) | °C, %, ppm, ppb |
| timestamp | TIMESTAMP | Momento de la lectura |

### Event
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| deviceId | UUID FK(device) | Dispositivo |
| type | VARCHAR(50) | boot, alarm, ack |
| payload | JSONB | Datos del evento |
| timestamp | TIMESTAMP | — |

### Recipe
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| userId | UUID FK(user) | Creador (nullable = públicas) |
| name | VARCHAR(100) | Nombre |
| species | VARCHAR(100) | Especie de hongo |
| incubationTempMin/Max | DECIMAL(5,2) | Rango incubación |
| incubationHumMin/Max | DECIMAL(5,2) | Rango humedad incubación |
| incubationCo2Max | INTEGER | CO2 max incubación |
| incubationDuration | INTEGER | Duración en días |
| fruitingTempMin/Max | DECIMAL(5,2) | Rango fructificación |
| fruitingHumMin/Max | DECIMAL(5,2) | Rango humedad fructificación |
| fruitingCo2Max | INTEGER | CO2 max fructificación |
| fruitingDuration | INTEGER | Duración en días |
| maintenanceTempMin/Max | DECIMAL(5,2) | Rango mantenimiento |
| maintenanceHumMin/Max | DECIMAL(5,2) | Rango humedad mantenimiento |
| maintenanceCo2Max | INTEGER | CO2 max mantenimiento |
| faeInterval | INTEGER | Intervalo ventilación (min) |
| faeLevel | ENUM(LOW,MEDIUM,HIGH) | Nivel de intercambio de aire |
| lightCycleHours | INTEGER | Horas de luz por día |

### CultivationCycle
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| userId | UUID FK(user) | Creador |
| recipeId | UUID FK(recipe) | Receta aplicada |
| deviceId | UUID FK(device) | Dispositivo asociado |
| status | ENUM(PLANNED,ACTIVE,COMPLETED,ABORTED) | Estado |
| currentPhase | ENUM(INCUBATION,FRUITING,MAINTENANCE,COMPLETED) | Fase |
| startDate | DATE | Inicio |
| estimatedEndDate | DATE | Fin estimado |

### CycleState
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| cycleId | UUID FK(cultivation_cycle) | Ciclo padre |
| phase | ENUM | Fase al momento del snapshot |
| temperature | DECIMAL(5,2) | Temp promedio |
| humidity | DECIMAL(5,2) | HR promedio |
| co2 | INTEGER | CO2 promedio |
| status | VARCHAR(20) | Estado del snapshot |
| snapshotDate | DATE | Fecha del snapshot |

### User
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| username | VARCHAR(50) UNIQUE | Nombre de usuario |
| email | VARCHAR(255) UNIQUE | Email |
| password | VARCHAR(255) | bcrypt hash |
| role | ENUM(SUPER_ADMIN,ADMIN,OPERATOR,VIEWER) | Rol |
| isActive | BOOLEAN | Cuenta activa |
| lastLoginAt | TIMESTAMP | Último login |

### AuditLog
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| userId | UUID FK(user) | Usuario |
| action | VARCHAR(50) | Acción realizada |
| resource | VARCHAR(50) | Tipo de recurso |
| resourceId | UUID | ID del recurso |
| details | JSONB | Detalles adicionales |
| createdAt | TIMESTAMP | — |

### UserChamberAccess
| Campo | Tipo | Descripción |
|---|---|---|
| id | UUID PK | — |
| userId | UUID FK(user) | Usuario con acceso |
| deviceId | UUID FK(device) | Dispositivo compartido |
| role | VARCHAR(20) | Rol de acceso |

## Sincronización

En desarrollo: `sequelize.sync({ alter: true })` al iniciar.
