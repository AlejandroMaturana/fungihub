import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';

export interface ActuatorCommandGeneratedEvent extends DomainEvent {
  type: 'ActuatorCommandGenerated';
  payload: {
    runId: RunId;
    deviceId: string;
    channel: number;
    state: 'ON' | 'OFF';
  };
}

export function createActuatorCommandGeneratedEvent(
  runId: RunId,
  deviceId: string,
  channel: number,
  state: 'ON' | 'OFF',
): ActuatorCommandGeneratedEvent {
  return {
    type: 'ActuatorCommandGenerated',
    timestamp: new Date(),
    payload: { runId, deviceId, channel, state },
  };
}
