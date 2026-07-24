import { SafetyRule, EvaluationContext, SafetyResult } from '../SafetyRule.js';

export class OverheatGuard implements SafetyRule {
  private readonly TEMP_THRESHOLD = 32;

  evaluate(context: EvaluationContext): SafetyResult {
    if (context.telemetry.temperature > this.TEMP_THRESHOLD) {
      return {
        triggered: true,
        guardName: 'OverheatGuard',
        controlState: 'EMERGENCY_STOP',
        reason: `Temperature ${context.telemetry.temperature}°C exceeds ${this.TEMP_THRESHOLD}°C`,
        alarm: {
          type: 'OVERHEAT',
          severity: 'CRITICAL',
          message: `Critical overheat: ${context.telemetry.temperature}°C`,
        },
      };
    }
    return { triggered: false, guardName: 'OverheatGuard', controlState: 'NORMAL', reason: '' };
  }
}
