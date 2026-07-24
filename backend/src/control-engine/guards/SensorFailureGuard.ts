import { SafetyRule, EvaluationContext, SafetyResult } from '../SafetyRule.js';

export class SensorFailureGuard implements SafetyRule {
  private readonly STALE_THRESHOLD_MS = 5 * 60 * 1000;

  evaluate(context: EvaluationContext): SafetyResult {
    const age = Date.now() - context.telemetry.timestamp.getTime();
    if (age > this.STALE_THRESHOLD_MS) {
      return {
        triggered: true,
        guardName: 'SensorFailureGuard',
        controlState: 'WAITING_SENSOR',
        reason: `Sensor data is ${Math.round(age / 1000)}s old (threshold: ${this.STALE_THRESHOLD_MS / 1000}s)`,
        alarm: {
          type: 'SENSOR_OFFLINE',
          severity: 'WARNING',
          message: `Sensor data stale for ${Math.round(age / 60000)} minutes`,
        },
      };
    }
    return { triggered: false, guardName: 'SensorFailureGuard', controlState: 'NORMAL', reason: '' };
  }
}
