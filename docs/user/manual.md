# Mush2 — Manual de Usuario

> Sistema de control de ambientes para cultivo de hongos adaptógenos.
> Versión: 0.9.1 | Protocolo HTTP polling: 1.0.0 | BLE Provisioning: 1.0.0

---

## Índice

1. [Introducción](#1-introducción)
2. [Arquitectura](#2-arquitectura)
3. [Conexión Inicial](#3-conexión-inicial)
4. [Dashboard](#4-dashboard)
5. [Dispositivos](#5-dispositivos)
6. [Recetas](#6-recetas)
7. [Ciclos de Cultivo](#7-ciclos-de-cultivo)
8. [Solución de Problemas](#8-solución-de-problemas)
9. [Provisioning BLE](#9-provisioning-ble)

---

## 1. Introducción

Mush2 es un sistema IoT para monitorear y controlar el ambiente de cámaras de cultivo de hongos. Consta de:

- **Controlador físico** (ESP32-S3-DevKitC-1) con componentes satelitales para abarcar funciones
- **Backend** en Node.js con base de datos PostgreSQL
- **Frontend** web accesible desde cualquier navegador

### Sensores compatibles
- **AHT21**: Temperatura y humedad (I2C 0x38)
- **ENS160**: Calidad del aire — CO₂, VOC, AQI (I2C 0x53)

### Actuadores
- **SSR1** (D5): Calefacción — control por histéresis de temperatura
- **SSR2** (D7): Ventilación — control por histéresis de temperatura + CO₂
- **SSR3** (D6): Humidificación — control por histéresis de humedad
- **SSR4** (D0): Iluminación — control por fotoperiodo 

---

## 2. Arquitectura

```
                    ┌─────────────────────────────────────────┐
                    │              WEB BROWSER                │
                    │  (Chrome/Edge 90+ — Web Bluetooth API)  │
                    └────────────┬────────────────────────────┘
                                 │ BLE (solo provisioning)
                                 ▼
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ SENSORES │───▶│ ESP32-S3 │───▶│  HTTP    │───▶│ BACKEND  │───▶│ Frontend │
│ AHT21    │    │          │    │ polling  │    │ Node.js  │    │   Web    │
│ ENS160   │    │          │    │ + MQTT   │    │ Postgres │    │          │
└──────────┘    └────┬─────┘    └──────────┘    └──────────┘    └──────────┘
                     │                                │
                ┌────▼─────┐                    ┌─────▼──────┐
                │ SSR/     │                    │ ThingSpeak │
                │ ACTUAD.  │                    │ (respaldo) │
                └──────────┘                    └────────────┘
```

- **BLE Provisioning**: Configuración Wi-Fi inicial desde el navegador vía Bluetooth
- **HTTP Polling**: Comunicación entre firmware y backend mediante peticiones HTTP periódicas
- **MQTT**: Comandos de actuadores en tiempo real
- **SSE**: Eventos en vivo del backend al frontend
- **REST API**: Operaciones CRUD (dispositivos, recetas, ciclos)
- **ThingSpeak**: Canal de respaldo con T/HR/CO₂/VOC cada 20s

---

## 3. Conexión Inicial

### Primer inicio del controlador

Cuando el ESP32-S3 arranca sin credenciales Wi-Fi guardadas, entra en **modo provisioning BLE**:

- El LED RGB parpadea en **azul** (0.75s ON / 0.75s OFF)
- El dispositivo se anuncia como `Mush2-XXXX` (últimos 4 dígitos del MAC)
- Permanece en este modo hasta recibir credenciales o por 5 minutos

### Provisionar desde el navegador

1. Conecta el ESP32-S3 a la corriente (USB o fuente externa)
2. Abre la web de Mush2 en **Chrome o Edge** (versión 90+)
3. Ve a **Dashboard** → haz clic en **ADD DEVICE**
4. Se abre el asistente de provisioning:
   - **ESCANEAR**: busca dispositivos Mush2 cercanos vía Bluetooth
   - **CONFIGURAR**: muestra información del dispositivo; ingresa SSID y contraseña Wi-Fi
   - **ENVIAR**: transmite las credenciales al dispositivo
   - **LISTO**: el dispositivo se reinicia y se conecta a la red
5. Tras el reinicio, el LED se apaga y el dispositivo aparece en el Dashboard

> **Nota**: Web Bluetooth requiere un gesto del usuario (clic) para escanear. Solo funciona en Chrome/Edge — no en Safari ni Firefox.

### Provisionar de nuevo (cambio de red)

Si el dispositivo ya tiene credenciales guardadas pero quieres cambiarlas:

1. Mantén presionado el botón de reset del ESP32-S3 durante la conexión, o
2. Desde el Dashboard, ve al detalle del dispositivo y usa la opción de **Factory Reset**
3. El dispositivo reiniciará en modo provisioning (LED azul pulsante)
4. Repite los pasos de provisioning

---

## 4. Dashboard

La página principal muestra:

- **Métricas en vivo**: Temperatura, humedad, CO₂, VOC con actualización SSE
- **Estado de dispositivos**: Online/Offline
- **Alertas**: Alarmas activas del sistema (HIGH_TEMP, LOW_HUM, HIGH_CO2, etc.)

### Agregar un nuevo dispositivo

Si no hay dispositivos, el Dashboard muestra una pantalla de inicio con el botón **ADD DEVICE**.
Si ya hay dispositivos, el botón **ADD DEVICE** está en el encabezado de la sección **Chambers**.
Ambos botones llevan al [asistente de provisioning BLE](#9-provisioning-ble).

---

## 5. Dispositivos

Cada controlador físico aparece como un dispositivo en el sistema.

### Detalle del dispositivo
- Información general (ID, MAC, firmware, estado)
- Actuadores con control individual (ON/OFF) — al enviar comando pasa a modo REMOTE
- Histórico de telemetría con filtros por tipo de sensor y rango de fechas

### Control manual
1. Abre el detalle del dispositivo
2. Usa los botones ON/OFF en cada actuador
3. El comando se encola y el firmware lo recoge en su próximo sondeo HTTP
4. El firmware confirma con un ACK
5. Al enviar un comando manual, el actuador pasa a modo REMOTE

---

## 6. Recetas

Las recetas definen los parámetros ideales para cada especie de hongo.

### Campos de una receta

| Campo | Descripción |
|---|---|
| Especie | Nombre científico del hongo |
| Incubación | Temp, humedad, CO₂ máx y duración (días) |
| Fructificación | Temp, humedad, CO₂ máx y duración (días) |
| Mantenimiento | Temp, humedad, CO₂ máx |
| FAE | Intervalo y nivel de ventilación |
| Luz | Ciclo luz/oscuridad en horas |

### Receta incluida
- **Melena de León** (*Hericium erinaceus*): 18d incubación (20-24°C / 85-95% HR / CO₂ <1200ppm) → 10d fructificación (18-22°C / 85-95% HR / CO₂ <1200ppm)

---

## 7. Ciclos de Cultivo

Un ciclo ejecuta una receta de principio a fin.

### Estados del ciclo

| Estado | Descripción |
|---|---|
| PLANIFICADO | Creado pero no iniciado |
| ACTIVO | En ejecución — el motor de control evalúa el dispositivo cada 60s |
| COMPLETADO | Ciclo finalizado exitosamente |
| ABORTADO | Cancelado manualmente |

### Fases del ciclo

1. **INCUBACIÓN**: El micelio coloniza el sustrato
2. **FRUCTIFICACIÓN**: Aparecen los primordios y cuerpos fructíferos
3. **MANTENIMIENTO**: Cosecha continua
4. **COMPLETADO**: Ciclo terminado

> El motor de control del backend evalúa automáticamente cada 60 segundos si los parámetros están dentro del rango de la fase actual. Cuando se cumple la duración de la fase, transiciona automáticamente a la siguiente. Se generan snapshots periódicos en CycleState.

### Crear un ciclo

1. Ve a **Ciclos** → botón "Nuevo ciclo"
2. Selecciona una receta
3. Configura el dispositivo asignado
4. El ciclo inicia en PLANIFICADO
5. Actívalo manualmente → pasa a INCUBACIÓN

---

## 8. Solución de Problemas

### El dispositivo no aparece en el Dashboard
- Verifica que el LED del ESP32-S3 esté encendido
- Revisa la conexión WiFi (el firmware muestra en monitor serie el estado)
- El backend debe estar corriendo y accesible vía HTTP
- Si hay 5+ reinicios consecutivos, el firmware entra en modo SAFE (espera 60s)

### Los sensores no reportan datos
- Verifica el cableado I2C (SDA→D2, SCL→D1)
- El ENS160 necesita el AHT21 para calibrarse (se pasa temp/hum vía setTempAndHum)
- El firmware reinicia el AHT21 automáticamente si falla el trigger de medición
- Revisa el monitor serial del firmware (115200 baud)

### Los actuadores no responden
- Verifica el modo de control (LOCAL/REMOTE/OFF)
- En modo REMOTE, los comandos HTTP tienen prioridad
- Las reglas de histéresis solo operan en modo LOCAL
- Si el backend no está accesible, el firmware reintenta la conexión periódicamente

### El escáner BLE no encuentra dispositivos
- El dispositivo debe estar en modo provisioning (LED azul pulsante). Si el LED está apagado, ya está conectado a Wi-Fi — haz factory reset
- Usa Chrome o Edge versión 90+ en un equipo con Bluetooth
- Verifica que el Bluetooth del equipo esté encendido
- La primera vez el navegador pedirá permiso para acceder al Bluetooth

### El provisioning falla con "GATT operation failed"
- El error ocurre si el dispositivo se reinicia antes de que el navegador reciba la confirmación. Reintenta la operación
- Si persiste, verifica que la señal Wi-Fi sea buena (SSID correcto)

### Cómo reiniciar el controlador
- Desconecta y vuelve a conectar la alimentación USB
- O usa el botón RST en el ESP32-S3

### Cómo actualizar el firmware por WiFi (OTA)
1. Envía comando HTTP a `POST /api/v1/devices/{id}/ota` con `{"action":"activate"}`
2. El firmware activa ArduinoOTA por 120s — flashea desde PlatformIO
3. O usa `{"action":"update","url":"http://..."}` para descarga HTTP directa

---

## Apéndice: Especies de prueba

| Especie | Incubación | Fructificación | Notas |
|---|---|---|---|
| *Hericium erinaceus* (Melena de León) | 20-24°C, 18d | 18-22°C, 10d | FAE alto |
| *Pleurotus ostreatus* (Ostra) | 22-26°C, 14d | 15-20°C, 7d | FAE medio |
| *Lentinula edodes* (Shiitake) | 20-24°C, 21d | 15-20°C, 10d | FAE medio |

---

## 9. Provisioning BLE

### Indicadores LED

| Modo | LED | Descripción |
|---|---|---|
| Provisioning | Azul pulsante (0.75s) | Esperando credenciales Wi-Fi vía BLE |
| Normal | Apagado | Funcionando en la red Wi-Fi |
| Alarma | Rojo fijo | Sobretemperatura o fallo de sensor |
| Degradado | Amarillo fijo | Sin datos de sensor válidos |
| Safe Mode | Rojo fijo (60s) | 5+ reinicios consecutivos |

### GATT Profile

El servicio BLE expone 5 características para el provisioning:

| UUID | Nombre | Permisos | Descripción |
|---|---|---|---|
| `a7c3...4c5d` | Servicio | — | Servicio de provisioning |
| `...e1...` | device_info | READ | JSON con deviceId, fwVer, hwRev |
| `...e2...` | wifi_ssid | WRITE | SSID de la red Wi-Fi |
| `...e3...` | wifi_pass | WRITE | Contraseña Wi-Fi |
| `...e4...` | prov_cmd | WRITE | Comandos: `provision`, `reset`, `factory_reset` |
| `...e5...` | prov_status | READ + NOTIFY | JSON con estado y mensaje |

### Comandos del canal prov_cmd

| Comando | Efecto |
|---|---|
| `provision` | Guarda SSID+pass en NVS y reinicia a modo normal |
| `reset` | Reinicia el dispositivo (manteniendo credenciales) |
| `factory_reset` | Borra NVS de provisioning y reinicia a modo BLE |

### Requisitos del navegador

- **Web Bluetooth API** — Chrome 90+, Edge 90+, navegadores basados en Chromium
- No funciona en Safari, Firefox ni navegadores iOS
- Requiere Bluetooth activo en el dispositivo

---

*Documentación actualizada el 2026-07-06 para Mush2 v0.9.1*
