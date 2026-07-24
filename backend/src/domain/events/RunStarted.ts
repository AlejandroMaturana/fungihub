import { DomainEvent } from '../../shared/index.js';
import { RunId, ChamberId, RecipeId } from '../value-objects/IDs.js';

export interface RunStartedEvent extends DomainEvent {
  type: 'RunStarted';
  payload: {
    runId: RunId;
    chamberId: ChamberId;
    recipeId: RecipeId;
    startedAt: Date;
  };
}

export function createRunStartedEvent(
  runId: RunId,
  chamberId: ChamberId,
  recipeId: RecipeId,
): RunStartedEvent {
  return {
    type: 'RunStarted',
    timestamp: new Date(),
    payload: { runId, chamberId, recipeId, startedAt: new Date() },
  };
}
