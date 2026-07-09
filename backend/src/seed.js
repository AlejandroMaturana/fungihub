import sequelize from './config/database.js';
import bcrypt from 'bcryptjs';
import { Recipe, User } from './models/index.js';

const RECIPES = [
  {
    name: 'Pearl Oyster — Standard',
    species: 'Pleurotus ostreatus',
    incubationTempMin: 20, incubationTempMax: 24,
    incubationHumMin: 85, incubationHumMax: 95,
    incubationCo2Max: 1200, incubationDurationDays: 21,
    fruitingTempMin: 14, fruitingTempMax: 18,
    fruitingHumMin: 85, fruitingHumMax: 92,
    fruitingCo2Max: 1000, fruitingDurationDays: 14,
    maintenanceTempMin: 12, maintenanceTempMax: 20,
    maintenanceHumMin: 80, maintenanceHumMax: 90,
    maintenanceCo2Max: 1200,
    faeIntervalMinutes: 10, ventilationStrategy: 'TIMER',
    lightCycleHours: 0, faeLevel: 'MEDIUM', dewPointMaxRH: 90,
  },
  {
    name: 'Pink Oyster — Tropical',
    species: 'Pleurotus djamor',
    incubationTempMin: 24, incubationTempMax: 28,
    incubationHumMin: 85, incubationHumMax: 95,
    incubationCo2Max: 1200, incubationDurationDays: 14,
    fruitingTempMin: 22, fruitingTempMax: 28,
    fruitingHumMin: 88, fruitingHumMax: 95,
    fruitingCo2Max: 1000, fruitingDurationDays: 10,
    maintenanceTempMin: 20, maintenanceTempMax: 26,
    maintenanceHumMin: 85, maintenanceHumMax: 92,
    maintenanceCo2Max: 1200,
    faeIntervalMinutes: 8, ventilationStrategy: 'TIMER',
    lightCycleHours: 0, faeLevel: 'MEDIUM', dewPointMaxRH: 92,
  },
  {
    name: 'Shiitake — Hardwood Log Block',
    species: 'Lentinula edodes',
    incubationTempMin: 21, incubationTempMax: 25,
    incubationHumMin: 80, incubationHumMax: 90,
    incubationCo2Max: 1200, incubationDurationDays: 60,
    fruitingTempMin: 10, fruitingTempMax: 16,
    fruitingHumMin: 80, fruitingHumMax: 88,
    fruitingCo2Max: 900, fruitingDurationDays: 21,
    maintenanceTempMin: 8, maintenanceTempMax: 18,
    maintenanceHumMin: 75, maintenanceHumMax: 85,
    maintenanceCo2Max: 1000,
    faeIntervalMinutes: 15, ventilationStrategy: 'HYBRID',
    lightCycleHours: 10, faeLevel: 'HIGH', dewPointMaxRH: 88,
  },
  {
    name: "Lion's Mane — Low CO2 Profile",
    species: 'Hericium erinaceus',
    incubationTempMin: 22, incubationTempMax: 26,
    incubationHumMin: 85, incubationHumMax: 92,
    incubationCo2Max: 1200, incubationDurationDays: 18,
    fruitingTempMin: 18, fruitingTempMax: 22,
    fruitingHumMin: 85, fruitingHumMax: 92,
    fruitingCo2Max: 800, fruitingDurationDays: 10,
    maintenanceTempMin: 15, maintenanceTempMax: 20,
    maintenanceHumMin: 80, maintenanceHumMax: 90,
    maintenanceCo2Max: 1000,
    faeIntervalMinutes: 6, ventilationStrategy: 'HYBRID',
    lightCycleHours: 6, faeLevel: 'HIGH', dewPointMaxRH: 90,
  },
  {
    name: 'Reishi — Cap/Shelf Form',
    species: 'Ganoderma lucidum',
    incubationTempMin: 24, incubationTempMax: 28,
    incubationHumMin: 85, incubationHumMax: 92,
    incubationCo2Max: 1200, incubationDurationDays: 45,
    fruitingTempMin: 22, fruitingTempMax: 26,
    fruitingHumMin: 85, fruitingHumMax: 90,
    fruitingCo2Max: 700, fruitingDurationDays: 30,
    maintenanceTempMin: 20, maintenanceTempMax: 24,
    maintenanceHumMin: 80, maintenanceHumMax: 88,
    maintenanceCo2Max: 1000,
    faeIntervalMinutes: 12, ventilationStrategy: 'CO2_TRIGGER',
    lightCycleHours: 12, faeLevel: 'HIGH', dewPointMaxRH: 88,
  },
  {
    name: 'Cordyceps militaris — Grain Stroma',
    species: 'Cordyceps militaris',
    incubationTempMin: 20, incubationTempMax: 23,
    incubationHumMin: 80, incubationHumMax: 88,
    incubationCo2Max: 1200, incubationDurationDays: 14,
    fruitingTempMin: 18, fruitingTempMax: 22,
    fruitingHumMin: 80, fruitingHumMax: 88,
    fruitingCo2Max: 1200, fruitingDurationDays: 21,
    maintenanceTempMin: 16, maintenanceTempMax: 20,
    maintenanceHumMin: 75, maintenanceHumMax: 85,
    maintenanceCo2Max: 1500,
    faeIntervalMinutes: 20, ventilationStrategy: 'TIMER',
    lightCycleHours: 12, faeLevel: 'LOW', dewPointMaxRH: 85,
  },
  {
    name: 'Turkey Tail — Extraction Grade',
    species: 'Trametes versicolor',
    incubationTempMin: 20, incubationTempMax: 24,
    incubationHumMin: 80, incubationHumMax: 90,
    incubationCo2Max: 1200, incubationDurationDays: 30,
    fruitingTempMin: 16, fruitingTempMax: 20,
    fruitingHumMin: 80, fruitingHumMax: 88,
    fruitingCo2Max: 950, fruitingDurationDays: 21,
    maintenanceTempMin: 14, maintenanceTempMax: 18,
    maintenanceHumMin: 75, maintenanceHumMax: 85,
    maintenanceCo2Max: 1000,
    faeIntervalMinutes: 15, ventilationStrategy: 'HYBRID',
    lightCycleHours: 8, faeLevel: 'MEDIUM', dewPointMaxRH: 87,
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('[Seed] DB conectada');

    for (const data of RECIPES) {
      const [recipe, created] = await Recipe.findOrCreate({
        where: { name: data.name },
        defaults: data,
      });
      console.log(`[Seed] ${created ? 'Creada' : 'Ya existe'}: ${recipe.name}`);
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
      console.log('[Seed] Usuario admin creado (password: admin123)');
    } else {
      console.log('[Seed] Usuario admin ya existe');
    }

    await sequelize.close();
    console.log('[Seed] OK — 7 recetas pobladas');
  } catch (err) {
    console.error('[Seed] Error:', err);
    process.exit(1);
  }
}

seed();
