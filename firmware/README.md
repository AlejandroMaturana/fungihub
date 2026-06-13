# Firmware — Mush2

## Hardware soportado

- ESP8266 (WeMos D1 Mini / ESP-12F)
- AHT21 (temp/humedad, I2C 0x38)
- ENS160 (CO2/VOC, I2C 0x53)
- SSR 3 canales (GPIO D2, D4, D6)

## Pinout

| Pin | Señal | Conexión |
|---|---|---|
| D1 (GPIO5) | SCL | AHT21 + ENS160 |
| D2 (GPIO4) | SDA | AHT21 + ENS160 |
| D3 (GPIO0) | SSR1 | Relé canal 1 |
| D4 (GPIO2) | SSR2 | Relé canal 2 |
| D6 (GPIO12) | SSR3 | Relé canal 3 |

## Dependencias (PlatformIO)

- Arduino Core for ESP8266
- PubSubClient (MQTT)
- Adafruit AHTX0
- ENS160 – Adafruit (o compatible)

## Compilación y flasheo

```bash
cd firmware
python generate_config.py ../.env    # genera config.h
pio run --target upload              # flashear
pio device monitor --baud 115200     # monitorear
```

## OTA

(Implementar en fase 8)
