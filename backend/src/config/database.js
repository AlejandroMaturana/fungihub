import { Sequelize } from 'sequelize';
import { env } from './env.js';

const sequelize = new Sequelize(env.DB.url || `postgresql://${env.DB.username}:${env.DB.password}@${env.DB.host}:${env.DB.port}/${env.DB.database}`, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? (sql) => console.log(sql) : false,
  pool: {
    max: 15,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
});

export default sequelize;
