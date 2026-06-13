import sequelize from './config/database.js';
import './models/index.js';

async function sync() {
  try {
    await sequelize.sync({ alter: true });
    console.log('[DB] Sincronización completada');
    process.exit(0);
  } catch (err) {
    console.error('[DB] Error:', err);
    process.exit(1);
  }
}

sync();
