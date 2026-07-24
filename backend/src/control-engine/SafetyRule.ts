import { Run, Telemetry, Alarm, ControlState } from '../domain/index.js';

export interface EvaluationContext {
  run: Run;
  telemetry: Telemetry;
  activeAlarms: Alarm[];
}

export interface SafetyResult {
  triggered: boolean;
  guardName: string;
  controlState: ControlState;
  reason: string;
  alarm?: {
    type: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
  };
}

export interface SafetyRule {
  evaluate(context: EvaluationContext): SafetyResult;
}
