import sequelize from './config/database.js';
import './models/index.js';

async function sync() {
  const LOCK_TIMEOUT_MS = 5000;
  const MAX_RETRIES = 3;

  console.log('[DB] sync-db: verificando si el servidor backend está activo...');
  console.log('[DB] Nota: Si el servidor está corriendo, puede haber deadlocks.');
  console.log(`[DB] lock_timeout = ${LOCK_TIMEOUT_MS}ms, max_retries = ${MAX_RETRIES}\n`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await sequelize.query(`SET lock_timeout = '${LOCK_TIMEOUT_MS}';`);
      console.log(`[DB] Intento ${attempt}/${MAX_RETRIES} — lock_timeout = ${LOCK_TIMEOUT_MS}ms`);
      await sequelize.sync({ alter: true });
      await sequelize.query('RESET lock_timeout;');
      console.log('[DB] Sincronización completada');
      process.exit(0);
    } catch (err) {
      await sequelize.query('RESET lock_timeout;').catch(() => {});

      if (err.original?.code === '40P01') {
        console.error(`[DB] Deadlock detectado en intento ${attempt}/${MAX_RETRIES}`);
        if (attempt < MAX_RETRIES) {
          const waitMs = attempt * 2000;
          console.log(`[DB] Reintentando en ${waitMs / 1000}s...\n`);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
      }

      console.error('[DB] Error:', err.message || err);
      process.exit(1);
    }
  }
}

sync();
