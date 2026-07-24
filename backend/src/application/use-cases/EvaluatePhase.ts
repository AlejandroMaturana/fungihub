import { Result, Ok, Err } from '../../shared/index.js';
import { Run, Recipe, Telemetry, RecipeRepository } from '../../domain/index.js';

export interface EvaluatePhaseInput {
  run: Run;
  latestTelemetry: Telemetry;
}

export interface EvaluatePhaseOutput {
  shouldTransition: boolean;
  newPhase?: string;
}

export class EvaluatePhase {
  constructor(
    private recipeRepo: RecipeRepository,
  ) {}

  async execute(input: EvaluatePhaseInput): Promise<Result<EvaluatePhaseOutput, Error>> {
    const recipe = await this.recipeRepo.findById(input.run.recipeId.value);
    if (!recipe) {
      return Err(new Error(`Recipe not found: ${input.run.recipeId.value}`));
    }

    const currentPhaseIndex = recipe.phases.findIndex(p => p.name === input.run.currentPhase);
    if (currentPhaseIndex === -1) {
      return Err(new Error(`Current phase "${input.run.currentPhase}" not found in recipe`));
    }

    if (currentPhaseIndex >= recipe.phases.length - 1) {
      return Ok({ shouldTransition: false });
    }

    const currentPhase = recipe.phases[currentPhaseIndex];
    const telemetry = input.latestTelemetry;

    const tempInRange = currentPhase.tempRange.contains(telemetry.temperature);
    const humInRange = currentPhase.humRange.contains(telemetry.humidity);
    const co2InRange = currentPhase.co2Target.contains(telemetry.co2);

    if (tempInRange && humInRange && co2InRange) {
      const nextPhase = recipe.phases[currentPhaseIndex + 1];
      return Ok({
        shouldTransition: true,
        newPhase: nextPhase.name,
      });
    }

    return Ok({ shouldTransition: false });
  }
}
