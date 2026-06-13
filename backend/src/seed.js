import sequelize from './config/database.js';
import bcrypt from 'bcryptjs';
import { Recipe, User } from './models/index.js';

const LIONS_MANE = {
  name: 'Melena de León',
  species: 'Hericium erinaceus',
  incubationTempMin: 20.0,
  incubationTempMax: 24.0,
  incubationHumMin: 85.0,
  incubationHumMax: 95.0,
  incubationCo2Max: 1200,
  incubationDurationDays: 18,
  fruitingTempMin: 18.0,
  fruitingTempMax: 22.0,
  fruitingHumMin: 85.0,
  fruitingHumMax: 95.0,
  fruitingCo2Max: 800,
  fruitingDurationDays: 10,
  maintenanceTempMin: 15.0,
  maintenanceTempMax: 20.0,
  maintenanceHumMin: 80.0,
  maintenanceHumMax: 90.0,
  maintenanceCo2Max: 1000,
  faeIntervalMinutes: 45,
  ventilationStrategy: 'HYBRID',
  lightCycleHours: 12,
  faeLevel: 'HIGH',
  dewPointMaxRH: 95.0,
};

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('[Seed] DB conectada');

    const [recipe, created] = await Recipe.findOrCreate({
      where: { species: LIONS_MANE.species },
      defaults: LIONS_MANE,
    });

    if (created) {
      console.log(`[Seed] Receta creada: ${recipe.name} (${recipe.species})`);
    } else {
      console.log(`[Seed] Receta ya existe: ${recipe.name}`);
    }

    const passwordHash = await bcrypt.hash('admin123', 10);
    const [user, userCreated] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@mush2.local',
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });

    if (userCreated) {
      console.log(`[Seed] Usuario admin creado (password: admin123)`);
    } else {
      console.log(`[Seed] Usuario admin ya existe`);
    }

    await sequelize.close();
    console.log('[Seed] OK');
  } catch (err) {
    console.error('[Seed] Error:', err);
    process.exit(1);
  }
}

seed();
