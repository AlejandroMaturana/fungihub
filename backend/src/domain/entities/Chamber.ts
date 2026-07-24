import { ChamberId } from '../value-objects/IDs.js';

export interface ChamberData {
  id: ChamberId;
  name: string;
  deviceId: string;
  location?: string;
}

export class Chamber {
  private constructor(
    readonly id: ChamberId,
    readonly name: string,
    readonly deviceId: string,
    readonly location?: string,
  ) {}

  static create(data: ChamberData): Chamber {
    return new Chamber(data.id, data.name, data.deviceId, data.location);
  }

  toData(): ChamberData {
    return {
      id: this.id,
      name: this.name,
      deviceId: this.deviceId,
      location: this.location,
    };
  }
}
