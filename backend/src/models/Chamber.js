import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Chamber = sequelize.define('Chamber', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(128), allowNull: false },
  volume: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  location: { type: DataTypes.STRING(255), allowNull: true },
  createdBy: { type: DataTypes.UUID, allowNull: true },
  updatedBy: { type: DataTypes.UUID, allowNull: true },
}, {
  tableName: 'chambers',
  timestamps: true,
});

export default Chamber;
