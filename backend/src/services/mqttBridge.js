import mqtt from 'mqtt';
import { Device, Telemetry, Actuator } from '../models/index.js';
import { events } from './eventBus.js';
import { sendActuatorUpdate } from './webSocketServer.js';

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://test.mosquitto.org:1883';
const TOPIC_PREFIX = 'mush2';

let client = null;
const connectedDevices = new Set();

export function startMqttBridge() {
  client = mqtt.connect(MQTT_BROKER, {
    clientId: `mush2_backend_${Date.now()}`,
    clean: true,
    reconnectPeriod: 5000,
  });

  client.on('connect', () => {
    console.log(`[MQTT] Conectado a ${MQTT_BROKER}`);
    client.subscribe(`${TOPIC_PREFIX}/+/telemetry`, { qos: 1 });
    client.subscribe(`${TOPIC_PREFIX}/+/status`, { qos: 1 });
    client.subscribe(`${TOPIC_PREFIX}/+/alarm`, { qos: 1 });
  });

  client.on('message', (topic, payload) => {
    const parts = topic.split('/');
    if (parts.length < 3) return;
    const deviceId = parts[1];
    const type = parts[2];

    try {
      const data = JSON.parse(payload.toString());
      if (type === 'telemetry') {
        handleTelemetry(deviceId, data);
      } else if (type === 'status') {
        connectedDevices.add(deviceId);
        events.emit('state', { deviceId, ...data });
      } else if (type === 'alarm') {
        events.emit('alarm', { deviceId, ...data });
      }
    } catch (err) {
      console.error(`[MQTT] Error parsing from ${topic}:`, err.message);
    }
  });

  client.on('error', (err) => {
    console.error(`[MQTT] Error: ${err.message}`);
  });

  client.on('close', () => {
    console.log('[MQTT] Desconectado');
  });

  events.on('control_eval', (data) => {
    if (!client || !client.connected) return;
    if (!data.deviceId) return;

    const topic = `${TOPIC_PREFIX}/${data.deviceId}/actuators`;
    client.publish(topic, JSON.stringify({
      type: 'actuator_state',
      deviceId: data.deviceId,
      timestamp: Date.now(),
      actuators: (data.actuatorCommands || []).map(c => ({
        channel: c.channel,
        state: c.command,
        mode: 'REMOTE',
      })),
    }), { qos: 1, retain: false });
  });

  console.log(`[MQTT] Bridge iniciado hacia ${MQTT_BROKER}`);
  return client;
}

export function publishActuatorCommand(deviceId, commands) {
  if (!client || !client.connected) return false;

  const topic = `${TOPIC_PREFIX}/${deviceId}/actuators`;
  client.publish(topic, JSON.stringify({
    type: 'actuator_state',
    deviceId,
    timestamp: Date.now(),
    actuators: commands.map(c => ({
      channel: c.channel,
      state: c.state,
      mode: c.mode || 'REMOTE',
    })),
  }), { qos: 1, retain: false });

  return true;
}

export function stopMqttBridge() {
  if (client) {
    client.end(true);
    client = null;
  }
}

async function handleTelemetry(deviceId, data) {
  try {
    const [device] = await Device.findOrCreate({
      where: { deviceId },
      defaults: { deviceId, status: 'ONLINE' },
    });

    const ts = new Date(data.ts || Date.now());
    const sensors = [
      { type: 'TEMPERATURE', value: data.temp, unit: '°C' },
      { type: 'HUMIDITY', value: data.hum, unit: '%' },
      { type: 'CO2', value: data.co2, unit: 'ppm' },
      { type: 'TVOC', value: data.tvoc, unit: 'ppb' },
    ];

    for (const s of sensors) {
      if (s.value == null) continue;
      await Telemetry.create({
        deviceId: device.id,
        sensorType: s.type,
        value: s.value,
        unit: s.unit,
        timestamp: ts,
      });
    }

    await device.update({ lastSeen: ts, status: 'ONLINE' });
  } catch (err) {
    console.error(`[MQTT] Error handling telemetry from ${deviceId}:`, err.message);
  }
}
