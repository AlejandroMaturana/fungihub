import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';
import { AlarmSeverity } from '../entities/Alarm.js';

export interface AlarmRaisedEvent extends DomainEvent {
  type: 'AlarmRaised';
  payload: {
    runId: RunId;
    alarmType: string;
    severity: AlarmSeverity;
    message: string;
  };
}

export function createAlarmRaisedEvent(
  runId: RunId,
  alarmType: string,
  severity: AlarmSeverity,
  message: string,
): AlarmRaisedEvent {
  return {
    type: 'AlarmRaised',
    timestamp: new Date(),
    payload: { runId, alarmType, severity, message },
  };
}
