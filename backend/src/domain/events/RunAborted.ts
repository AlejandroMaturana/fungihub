import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';

export interface RunAbortedEvent extends DomainEvent {
  type: 'RunAborted';
  payload: {
    runId: RunId;
    reason?: string;
    abortedAt: Date;
  };
}

export function createRunAbortedEvent(runId: RunId, reason?: string): RunAbortedEvent {
  return {
    type: 'RunAborted',
    timestamp: new Date(),
    payload: { runId, reason, abortedAt: new Date() },
  };
}
