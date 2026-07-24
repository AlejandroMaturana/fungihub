import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';

export interface PhaseTransitionedEvent extends DomainEvent {
  type: 'PhaseTransitioned';
  payload: {
    runId: RunId;
    fromPhase: string;
    toPhase: string;
    triggeredBy: string;
  };
}

export function createPhaseTransitionedEvent(
  runId: RunId,
  fromPhase: string,
  toPhase: string,
  triggeredBy: string,
): PhaseTransitionedEvent {
  return {
    type: 'PhaseTransitioned',
    timestamp: new Date(),
    payload: { runId, fromPhase, toPhase, triggeredBy },
  };
}
