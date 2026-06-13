import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3797', 10),

  DB: {
    database: process.env.DB_NAME || 'mush2',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    url: process.env.DATABASE_URL,
  },

  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production',

  MQTT: {
    broker: process.env.MQTT_BROKER || 'test.mosquitto.org',
    port: parseInt(process.env.MQTT_PORT || '1883', 10),
    fallbackBroker: process.env.MQTT_BROKER_FALLBACK || 'broker.hivemq.com',
    fallbackPort: parseInt(process.env.MQTT_PORT_FALLBACK || '1883', 10),
  },

  TS: {
    apiKey: process.env.TS_API_KEY || '',
    host: process.env.TS_HOST || 'api.thingspeak.com',
    port: parseInt(process.env.TS_PORT || '80', 10),
  },

  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
