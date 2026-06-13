# ADR-001: Uso de ThingSpeak como canal secundario de telemetría

**Fecha**: 2026-06-12
**Estado**: Aceptado

## Contexto
El sistema necesita un canal de telemetría de respaldo para cuando el backend o el broker MQTT no están disponibles. El canal principal es MQTT → Backend → PostgreSQL. Se requiere un segundo canal independiente que bufferé datos durante caídas.

## Decisión
Usar ThingSpeak como canal secundario. El firmware envía un HTTP GET a ThingSpeak API en cada ciclo de telemetría (cada 20s).

## Motivos
1. **Independencia**: ThingSpeak no depende del broker MQTT ni del backend.
2. **Simplicidad**: HTTP GET, sin librerías adicionales en el ESP8266.
3. **Gratuito**: Plan gratuito suficiente para prototipado (~8200 mensajes/día).
4. **Buffer**: Retiene datos aunque backend esté caído. Al recuperarse, backend sincroniza desde ThingSpeak.

## Consecuencias
- El firmware envía datos duplicados (MQTT + HTTP). Es intencional.
- Se necesita cifrar la API key de ThingSpeak en la DB del backend (AES-256-GCM).
- Límite de ThingSpeak: 15s entre updates (configuramos a 20s para estar dentro).
- ThingSpeak es un punto externo; si cae, no afecta al flujo principal MQTT.

## Alternativas descartadas
- **InfluxDB + Telegraf**: Sobrecarga para el ESP8266.
- **Buffer local en firmware**: El ESP8266 no tiene RAM suficiente para buffer prolongado.
- **Segundo broker MQTT**: Ya tenemos failover de broker, pero ThingSpeak es un canal diferente.

## Detalle técnico

### Envío desde firmware
```cpp
// thingspeak_client.cpp
HTTPClient http;
String url = "http://api.thingspeak.com/update?api_key=" TS_API_KEY
           + "&field1=" + String(temperature)
           + "&field2=" + String(humidity)
           + "&field3=" + String(co2)
           + "&field4=" + String(voc);
http.begin(url);
int code = http.GET();
```

### Sincronización desde backend
```javascript
// thingSpeakSync.js
const res = await fetch(`https://api.thingspeak.com/channels/${ch}/feeds.json?api_key=${key}&days=1`);
const feeds = await res.json();
for (const feed of feeds) {
  if (!existsInDB(feed.created_at)) {
    Telemetry.create({ ts: feed.created_at, ... });
  }
}
```
