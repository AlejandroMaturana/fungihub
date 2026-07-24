import { DomainEvent } from '../../shared/index.js';

export interface DeviceOfflineEvent extends DomainEvent {
  type: 'DeviceOffline';
  payload: {
    deviceId: string;
    lastSeen: Date;
    reason?: string;
  };
}

export function createDeviceOfflineEvent(
  deviceId: string,
  lastSeen: Date,
  reason?: string,
): DeviceOfflineEvent {
  return {
    type: 'DeviceOffline',
    timestamp: new Date(),
    payload: { deviceId, lastSeen, reason },
  };
}
