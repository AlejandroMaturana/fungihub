import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { encrypt, decrypt } from '../services/encryption.js';

const IntegrationCredentials = sequelize.define('IntegrationCredentials', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  deviceId: { type: DataTypes.INTEGER, allowNull: false },
  provider: {
    type: DataTypes.ENUM('THINGSPEAK', 'INFLUXDB', 'MQTT', 'CUSTOM'),
    allowNull: false,
    defaultValue: 'THINGSPEAK',
  },
  encryptedCredentials: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'ERROR', 'DISABLED'),
    defaultValue: 'ACTIVE',
  },
  lastUsed: { type: DataTypes.DATE },
  lastError: { type: DataTypes.STRING(500) },
}, {
  tableName: 'integration_credentials',
  timestamps: true,
});

IntegrationCredentials.prototype.getDecryptedCredentials = function () {
  try {
    return JSON.parse(decrypt(this.encryptedCredentials));
  } catch {
    return null;
  }
};

IntegrationCredentials.setCredentials = async function (deviceId, provider, credentials) {
  const payload = JSON.stringify(credentials);
  const encrypted = encrypt(payload);
  const [instance] = await this.upsert({
    deviceId,
    provider,
    encryptedCredentials: encrypted,
    status: 'ACTIVE',
  });
  return instance;
};

export default IntegrationCredentials;
