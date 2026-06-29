import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import sequelize from './config/database.js';
import { startControlEngine } from './services/controlEngine.js';
import { startWebSocketServer, sendActuatorUpdate } from './services/webSocketServer.js';
import { startMqttBridge, publishActuatorCommand } from './services/mqttBridge.js';
import { events } from './services/eventBus.js';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Conexión establecida');

    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Modelos sincronizados');
    }

    startControlEngine();
    startMqttBridge();

    const httpServer = createServer(app);
    startWebSocketServer(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`[Server] Mush2 backend en puerto ${env.PORT}`);
    });

    const publishActuators = (data) => {
      if (!data.deviceId || !data.actuatorCommands) return;
      const cmds = data.actuatorCommands.map(c => ({ channel: c.channel, state: c.command, mode: 'REMOTE' }));
      sendActuatorUpdate(data.deviceId, cmds);
      publishActuatorCommand(data.deviceId, cmds);
    };

    events.on('control_eval', publishActuators);
  } catch (err) {
    console.error('[FATAL] Error al iniciar:', err);
    process.exit(1);
  }
}

start();
