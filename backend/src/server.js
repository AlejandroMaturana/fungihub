import app from './app.js';
import { env } from './config/env.js';
import sequelize from './config/database.js';
import { connectMQTT } from './services/mqttService.js';
import { startControlEngine } from './services/controlEngine.js';
import './models/index.js';

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] Conexión establecida');

    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('[DB] Modelos sincronizados');
    }

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
