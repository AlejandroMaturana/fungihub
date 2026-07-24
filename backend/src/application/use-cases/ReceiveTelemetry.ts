import { Result, Ok, Err, EventBus, UUID, Clock } from '../../shared/index.js';
import { Telemetry, TelemetryRepository, RunRepository, RunId, createTelemetryReceivedEvent } from '../../domain/index.js';

export interface ReceiveTelemetryInput {
  runId: string;
  deviceId: string;
  temperature: number;
  humidity: number;
  co2: number;
  voc: number;
  aqi: number;
  ssrState: number[];
  wifiRssi: number;
}

export class ReceiveTelemetry {
  constructor(
    private telemetryRepo: TelemetryRepository,
    private runRepo: RunRepository,
    private eventBus: EventBus,
    private uuid: UUID,
    private clock: Clock,
  ) {}

  async execute(input: ReceiveTelemetryInput): Promise<Result<Telemetry, Error>> {
    if (input.temperature < -10 || input.temperature > 50) {
      return Err(new Error(`Invalid temperature: ${input.temperature}`));
    }
    if (input.humidity < 0 || input.humidity > 100) {
      return Err(new Error(`Invalid humidity: ${input.humidity}`));
    }
    if (input.co2 < 0 || input.co2 > 10000) {
      return Err(new Error(`Invalid CO2: ${input.co2}`));
    }

    const run = await this.runRepo.findById(input.runId);
    if (!run) {
      return Err(new Error(`Run not found: ${input.runId}`));
    }

    const telemetry = Telemetry.create({
      id: this.uuid.generate(),
      runId: RunId.create(input.runId),
      deviceId: input.deviceId,
      timestamp: this.clock.now(),
      temperature: input.temperature,
      humidity: input.humidity,
      co2: input.co2,
      voc: input.voc,
      aqi: input.aqi,
      ssrState: input.ssrState,
      wifiRssi: input.wifiRssi,
    });

    await this.telemetryRepo.save(telemetry);

    this.eventBus.publish(createTelemetryReceivedEvent(
      telemetry.runId,
      telemetry.deviceId,
      telemetry.temperature,
      telemetry.humidity,
      telemetry.co2,
    ));

    return Ok(telemetry);
  }
}
