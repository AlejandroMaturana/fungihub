import { DomainEvent } from '../../shared/index.js';

export interface DeviceOnlineEvent extends DomainEvent {
  type: 'DeviceOnline';
  payload: {
    deviceId: string;
    connectedAt: Date;
  };
}

export function createDeviceOnlineEvent(deviceId: string): DeviceOnlineEvent {
  return {
    type: 'DeviceOnline',
    timestamp: new Date(),
    payload: { deviceId, connectedAt: new Date() },
  };
}
