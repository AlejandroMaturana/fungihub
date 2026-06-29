import { Device } from '../models/index.js';
import sequelize from '../config/database.js';

async function main() {
  console.log("Authenticating...");
  await sequelize.authenticate();
  console.log("Authenticated. Querying device...");
  const device = await Device.findOne({ where: { deviceId: 'mush2_A0F262E55CBC' } });
  console.log("Device query result:", device ? device.toJSON() : 'null');
  await sequelize.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
