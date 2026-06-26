import app from './app.js';
import { env } from './config/env.js';
import sequelize from './config/database.js';
import { Device, Actuator, Telemetry } from './models/index.js';
import { connectMQTT } from './services/mqttService.js';
import { startControlEngine } from './services/controlEngine.js';

const STALE_DEVICE_IDS = ['esp8266_001'];

async function cleanupStaleDevices() {
  for (const deviceId of STALE_DEVICE_IDS) {
    const device = await Device.findOne({ where: { deviceId } });
    if (!device) continue;
    await Actuator.destroy({ where: { deviceId: device.id } });
    await Telemetry.destroy({ where: { deviceId: device.id } });
    await device.destroy();
    console.log(`[DB] Dispositivo obsoleto eliminado: ${deviceId}`);
  }
}

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Conexión establecida');

    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Modelos sincronizados');
    }

    await cleanupStaleDevices();

    connectMQTT();
    startControlEngine();

    app.listen(env.PORT, () => {
      console.log(`[Server] Mush2 backend en puerto ${env.PORT}`);
    });
  } catch (err) {
    console.error('[FATAL] Error al iniciar:', err);
    process.exit(1);
  }
}

start();
