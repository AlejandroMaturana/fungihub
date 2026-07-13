import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PhaseTransition = sequelize.define('PhaseTransition', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cycleId: { type: DataTypes.INTEGER, allowNull: false },
  fromPhase: {
    type: DataTypes.ENUM('INCUBATION', 'FRUITING', 'MAINTENANCE', 'COMPLETED'),
    allowNull: false,
  },
  toPhase: {
    type: DataTypes.ENUM('INCUBATION', 'FRUITING', 'MAINTENANCE', 'COMPLETED'),
    allowNull: false,
  },
  triggerType: {
    type: DataTypes.ENUM('TIME', 'SENSOR', 'MANUAL', 'SENSOR_SUGGESTED'),
    allowNull: false,
  },
  triggerData: { type: DataTypes.JSONB, defaultValue: {} },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'EXECUTED', 'REJECTED'),
    defaultValue: 'EXECUTED',
  },
  approvedBy: { type: DataTypes.UUID, allowNull: true },
  notes: { type: DataTypes.TEXT },
  executedAt: { type: DataTypes.DATE },
}, {
  tableName: 'phase_transitions',
  timestamps: true,
  indexes: [
    { fields: ['cycleId'] },
    { fields: ['status'] },
  ],
});

export default PhaseTransition;
