import { Result, Ok, Clock } from '../../shared/index.js';
import { Run, Telemetry, Alarm, AlarmRepository, createAlarmRaisedEvent, createAlarmResolvedEvent } from '../../domain/index.js';
import { EventBus } from '../../shared/index.js';

export interface RaiseAlarmsInput {
  run: Run;
  telemetry: Telemetry;
}

export interface RaiseAlarmsOutput {
  raised: Alarm[];
  resolved: Alarm[];
}

export class RaiseAlarms {
  constructor(
    private alarmRepo: AlarmRepository,
    private eventBus: EventBus,
    private clock: Clock,
  ) {}

  async execute(input: RaiseAlarmsInput): Promise<Result<RaiseAlarmsOutput, Error>> {
    const activeAlarms = await this.alarmRepo.findActiveByRunId(input.run.id.value);
    const raised: Alarm[] = [];
    const resolved: Alarm[] = [];

    if (input.telemetry.temperature > 35) {
      const existing = activeAlarms.find(a => a.type === 'TEMP_CRITICAL');
      if (!existing) {
        const alarm = Alarm.create({
          runId: input.run.id,
          type: 'TEMP_CRITICAL',
          severity: 'CRITICAL',
          message: `Temperature ${input.telemetry.temperature}°C exceeds critical threshold`,
          status: 'ACTIVE',
          raisedAt: this.clock.now(),
        });
        await this.alarmRepo.save(alarm);
        raised.push(alarm);
        this.eventBus.publish(createAlarmRaisedEvent(
          input.run.id, 'TEMP_CRITICAL', 'CRITICAL', alarm.message,
        ));
      }
    }

    if (input.telemetry.temperature < 5) {
      const existing = activeAlarms.find(a => a.type === 'TEMP_FREEZING');
      if (!existing) {
        const alarm = Alarm.create({
          runId: input.run.id,
          type: 'TEMP_FREEZING',
          severity: 'WARNING',
          message: `Temperature ${input.telemetry.temperature}°C below freezing threshold`,
          status: 'ACTIVE',
          raisedAt: this.clock.now(),
        });
        await this.alarmRepo.save(alarm);
        raised.push(alarm);
        this.eventBus.publish(createAlarmRaisedEvent(
          input.run.id, 'TEMP_FREEZING', 'WARNING', alarm.message,
        ));
      }
    }

    for (const alarm of activeAlarms) {
      if (alarm.type === 'TEMP_CRITICAL' && input.telemetry.temperature <= 30) {
        await this.alarmRepo.resolve(alarm.id!, this.clock.now());
        resolved.push(alarm);
        this.eventBus.publish(createAlarmResolvedEvent(input.run.id, 'TEMP_CRITICAL'));
      }
      if (alarm.type === 'TEMP_FREEZING' && input.telemetry.temperature >= 10) {
        await this.alarmRepo.resolve(alarm.id!, this.clock.now());
        resolved.push(alarm);
        this.eventBus.publish(createAlarmResolvedEvent(input.run.id, 'TEMP_FREEZING'));
      }
    }

    return Ok({ raised, resolved });
  }
}
