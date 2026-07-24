import { DomainEvent } from '../../shared/index.js';
import { RunId } from '../value-objects/IDs.js';

export interface TelemetryReceivedEvent extends DomainEvent {
  type: 'TelemetryReceived';
  payload: {
    runId: RunId;
    deviceId: string;
    temperature: number;
    humidity: number;
    co2: number;
  };
}

export function createTelemetryReceivedEvent(
  runId: RunId,
  deviceId: string,
  temperature: number,
  humidity: number,
  co2: number,
): TelemetryReceivedEvent {
  return {
    type: 'TelemetryReceived',
    timestamp: new Date(),
    payload: { runId, deviceId, temperature, humidity, co2 },
  };
}
