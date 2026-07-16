import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  macAddress: { type: DataTypes.STRING(50), unique: true, allowNull: true },
  deviceId: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  firmwareVersion: { type: DataTypes.STRING(20), defaultValue: '0.0.0' },
  hwRevision: { type: DataTypes.STRING(10), defaultValue: '' },
  status: {
    type: DataTypes.ENUM('ONLINE', 'OFFLINE', 'MAINTENANCE', 'ERROR'),
    defaultValue: 'OFFLINE',
  },
  lastSeen: { type: DataTypes.DATE },
  userId: { type: DataTypes.UUID, allowNull: true },
  chamberId: { type: DataTypes.INTEGER, allowNull: true },
  chamberName: { type: DataTypes.STRING(128) },
  chamberLocation: { type: DataTypes.STRING(255) },
  ssrActiveLow: { type: DataTypes.BOOLEAN, defaultValue: true },
  thingSpeakEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  thingSpeakChannelId: { type: DataTypes.STRING(20), allowNull: true },
  thingSpeakReadKey: { type: DataTypes.STRING(32), allowNull: true },
  thingSpeakWriteKey: { type: DataTypes.STRING(32), allowNull: true },
  thingSpeakSyncInterval: { type: DataTypes.INTEGER, defaultValue: 300000 },
  controlMode: {
    type: DataTypes.ENUM('LOCAL', 'REMOTE', 'OFF', 'AUTO'),
    defaultValue: 'AUTO',
  },
  lastFirmwareState: { type: DataTypes.STRING(30), allowNull: true },
}, {
  tableName: 'devices',
  timestamps: true,
});

export default Device;
