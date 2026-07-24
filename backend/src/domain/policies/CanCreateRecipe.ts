import { Result, Ok, Err } from '../../shared/index.js';
import { RecipeWithoutPhases } from '../errors/index.js';
import { Phase } from '../value-objects/Phase.js';

export class CanCreateRecipe {
  evaluate(phases: Phase[]): Result<void, RecipeWithoutPhases> {
    if (phases.length === 0) {
      return Err(new RecipeWithoutPhases(
        'Recipe must have at least one phase',
      ));
    }
    return Ok(undefined);
  }
}
