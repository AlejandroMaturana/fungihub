import { DomainEvent } from '../../shared/index.js';

export interface SensorOfflineEvent extends DomainEvent {
  type: 'SensorOffline';
  payload: {
    deviceId: string;
    sensorType: string;
    lastSeen: Date;
  };
}

export function createSensorOfflineEvent(
  deviceId: string,
  sensorType: string,
  lastSeen: Date,
): SensorOfflineEvent {
  return {
    type: 'SensorOffline',
    timestamp: new Date(),
    payload: { deviceId, sensorType, lastSeen },
  };
}
