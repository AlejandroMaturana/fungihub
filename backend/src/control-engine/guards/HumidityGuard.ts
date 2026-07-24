import { SafetyRule, EvaluationContext, SafetyResult } from '../SafetyRule.js';

export class HumidityGuard implements SafetyRule {
  private readonly HUM_LOW = 60;
  private readonly HUM_HIGH = 95;

  evaluate(context: EvaluationContext): SafetyResult {
    const hum = context.telemetry.humidity;

    if (hum < this.HUM_LOW) {
      return {
        triggered: true,
        guardName: 'HumidityGuard',
        controlState: 'SAFE_MODE',
        reason: `Humidity ${hum}% below minimum ${this.HUM_LOW}%`,
        alarm: {
          type: 'HUMIDITY_LOW',
          severity: 'WARNING',
          message: `Humidity critically low: ${hum}%`,
        },
      };
    }

    if (hum > this.HUM_HIGH) {
      return {
        triggered: true,
        guardName: 'HumidityGuard',
        controlState: 'SAFE_MODE',
        reason: `Humidity ${hum}% above maximum ${this.HUM_HIGH}%`,
        alarm: {
          type: 'HUMIDITY_HIGH',
          severity: 'WARNING',
          message: `Humidity critically high: ${hum}%`,
        },
      };
    }

    return { triggered: false, guardName: 'HumidityGuard', controlState: 'NORMAL', reason: '' };
  }
}
