import { Result, Ok, Err } from '../../shared/index.js';
import { RecipeId } from '../value-objects/IDs.js';
import { Phase } from '../value-objects/Phase.js';

export interface RecipeData {
  id: RecipeId;
  name: string;
  species: string;
  phases: Phase[];
}

export class Recipe {
  private constructor(
    readonly id: RecipeId,
    readonly name: string,
    readonly species: string,
    readonly phases: Phase[],
  ) {}

  static create(data: RecipeData): Result<Recipe, string> {
    if (!data.name || data.name.trim().length === 0) {
      return Err('Recipe name cannot be empty');
    }
    if (!data.species || data.species.trim().length === 0) {
      return Err('Recipe species cannot be empty');
    }
    if (data.phases.length === 0) {
      return Err('Recipe must have at least one phase');
    }
    return Ok(new Recipe(
      data.id,
      data.name.trim(),
      data.species.trim(),
      data.phases,
    ));
  }

  getPhaseByName(name: string): Phase | undefined {
    return this.phases.find(p => p.name === name);
  }

  getFirstPhase(): Phase {
    return this.phases[0];
  }

  toData(): RecipeData {
    return {
      id: this.id,
      name: this.name,
      species: this.species,
      phases: this.phases,
    };
  }
}
