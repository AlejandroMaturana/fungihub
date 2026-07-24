import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';
import { ControlState } from '../entities/Run.js';

export interface SafetyTriggeredEvent extends DomainEvent {
  type: 'SafetyTriggered';
  payload: {
    runId: RunId;
    guardName: string;
    controlState: ControlState;
    reason: string;
  };
}

export function createSafetyTriggeredEvent(
  runId: RunId,
  guardName: string,
  controlState: ControlState,
  reason: string,
): SafetyTriggeredEvent {
  return {
    type: 'SafetyTriggered',
    timestamp: new Date(),
    payload: { runId, guardName, controlState, reason },
  };
}
