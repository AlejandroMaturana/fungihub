import { SafetyRule, EvaluationContext, SafetyResult } from './SafetyRule.js';
import { OverheatGuard } from './guards/OverheatGuard.js';
import { SensorFailureGuard } from './guards/SensorFailureGuard.js';
import { HumidityGuard } from './guards/HumidityGuard.js';
import { CommunicationGuard } from './guards/CommunicationGuard.js';

export { SafetyRule, EvaluationContext, SafetyResult } from './SafetyRule.js';
export { OverheatGuard } from './guards/OverheatGuard.js';
export { SensorFailureGuard } from './guards/SensorFailureGuard.js';
export { HumidityGuard } from './guards/HumidityGuard.js';
export { CommunicationGuard } from './guards/CommunicationGuard.js';

export function createDefaultGuards(): SafetyRule[] {
  return [
    new OverheatGuard(),
    new SensorFailureGuard(),
    new HumidityGuard(),
    new CommunicationGuard(),
  ];
}

export class ControlEngine {
  constructor(private guards: SafetyRule[]) {}

  evaluate(context: EvaluationContext): SafetyResult[] {
    const results: SafetyResult[] = [];
    for (const guard of this.guards) {
      const result = guard.evaluate(context);
      if (result.triggered) {
        results.push(result);
      }
    }
    return results;
  }

  evaluateFirst(context: EvaluationContext): SafetyResult | null {
    for (const guard of this.guards) {
      const result = guard.evaluate(context);
      if (result.triggered) {
        return result;
      }
    }
    return null;
  }
}
