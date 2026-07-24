import { RunId } from '../value-objects/IDs.js';

export interface TelemetryData {
  id?: string;
  runId: RunId;
  deviceId: string;
  timestamp: Date;
  temperature: number;
  humidity: number;
  co2: number;
  voc: number;
  aqi: number;
  ssrState: number[];
  wifiRssi: number;
}

export class Telemetry {
  private constructor(
    readonly id: string | undefined,
    readonly runId: RunId,
    readonly deviceId: string,
    readonly timestamp: Date,
    readonly temperature: number,
    readonly humidity: number,
    readonly co2: number,
    readonly voc: number,
    readonly aqi: number,
    readonly ssrState: number[],
    readonly wifiRssi: number,
  ) {}

  static create(data: TelemetryData): Telemetry {
    return new Telemetry(
      data.id,
      data.runId,
      data.deviceId,
      data.timestamp,
      data.temperature,
      data.humidity,
      data.co2,
      data.voc,
      data.aqi,
      data.ssrState,
      data.wifiRssi,
    );
  }

  isTemperatureOutOfRange(tempMin: number, tempMax: number): boolean {
    return this.temperature < tempMin || this.temperature > tempMax;
  }

  isHumidityOutOfRange(humMin: number, humMax: number): boolean {
    return this.humidity < humMin || this.humidity > humMax;
  }

  isCO2OutOfRange(co2Min: number, co2Max: number): boolean {
    return this.co2 < co2Min || this.co2 > co2Max;
  }

  toData(): TelemetryData {
    return {
      id: this.id,
      runId: this.runId,
      deviceId: this.deviceId,
      timestamp: this.timestamp,
      temperature: this.temperature,
      humidity: this.humidity,
      co2: this.co2,
      voc: this.voc,
      aqi: this.aqi,
      ssrState: this.ssrState,
      wifiRssi: this.wifiRssi,
    };
  }
}
