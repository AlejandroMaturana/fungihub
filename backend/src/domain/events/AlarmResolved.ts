import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';

export interface AlarmResolvedEvent extends DomainEvent {
  type: 'AlarmResolved';
  payload: {
    runId: RunId;
    alarmType: string;
    resolvedAt: Date;
  };
}

export function createAlarmResolvedEvent(runId: RunId, alarmType: string): AlarmResolvedEvent {
  return {
    type: 'AlarmResolved',
    timestamp: new Date(),
    payload: { runId, alarmType, resolvedAt: new Date() },
  };
}
