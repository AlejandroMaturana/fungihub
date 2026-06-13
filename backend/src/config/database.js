import { Sequelize } from 'sequelize';
import { env } from './env.js';

const sequelize = new Sequelize(env.DB.url || `postgresql://${env.DB.username}:${env.DB.password}@${env.DB.host}:${env.DB.port}/${env.DB.database}`, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? false : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
