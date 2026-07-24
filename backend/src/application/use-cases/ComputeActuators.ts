import { Result, Ok } from '../../shared/index.js';
import { Run, Telemetry, Recipe, RecipeRepository } from '../../domain/index.js';

export interface ActuatorCommand {
  channel: number;
  state: 'ON' | 'OFF';
  reason: string;
}

export interface ComputeActuatorsInput {
  run: Run;
  telemetry: Telemetry;
}

export class ComputeActuators {
  constructor(
    private recipeRepo: RecipeRepository,
  ) {}

  async execute(input: ComputeActuatorsInput): Promise<Result<ActuatorCommand[], Error>> {
    const recipe = await this.recipeRepo.findById(input.run.recipeId.value);
    if (!recipe) {
      return Ok([]);
    }

    const phase = recipe.getPhaseByName(input.run.currentPhase);
    if (!phase) {
      return Ok([]);
    }

    const commands: ActuatorCommand[] = [];
    const t = input.telemetry;

    if (t.temperature < phase.tempRange.min) {
      commands.push({ channel: 1, state: 'ON', reason: 'Heater ON: temp below min' });
    } else if (t.temperature > phase.tempRange.max) {
      commands.push({ channel: 1, state: 'OFF', reason: 'Heater OFF: temp above max' });
    }

    if (t.humidity < phase.humRange.min) {
      commands.push({ channel: 2, state: 'ON', reason: 'Humidifier ON: humidity below min' });
    } else if (t.humidity > phase.humRange.max) {
      commands.push({ channel: 2, state: 'OFF', reason: 'Humidifier OFF: humidity above max' });
    }

    if (t.co2 > phase.co2Target.max) {
      commands.push({ channel: 0, state: 'ON', reason: 'Fan ON: CO2 above max' });
    } else if (t.co2 < phase.co2Target.min) {
      commands.push({ channel: 0, state: 'OFF', reason: 'Fan OFF: CO2 below min' });
    }

    return Ok(commands);
  }
}
