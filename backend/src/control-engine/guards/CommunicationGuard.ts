import { SafetyRule, EvaluationContext, SafetyResult } from '../SafetyRule.js';

export class CommunicationGuard implements SafetyRule {
  private readonly OFFLINE_THRESHOLD_MS = 10 * 60 * 1000;

  evaluate(context: EvaluationContext): SafetyResult {
    const age = Date.now() - context.telemetry.timestamp.getTime();
    if (age > this.OFFLINE_THRESHOLD_MS) {
      return {
        triggered: true,
        guardName: 'CommunicationGuard',
        controlState: 'OFFLINE_DEVICE',
        reason: `Device offline for ${Math.round(age / 60000)} minutes`,
        alarm: {
          type: 'DEVICE_OFFLINE',
          severity: 'CRITICAL',
          message: `Device not communicating for ${Math.round(age / 60000)} minutes`,
        },
      };
    }
    return { triggered: false, guardName: 'CommunicationGuard', controlState: 'NORMAL', reason: '' };
  }
}
