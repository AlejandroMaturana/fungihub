import { Run, Telemetry } from '../../domain/index.js';

export interface EvaluationResult {
  run: Run;
  telemetry: Telemetry;
  phaseTransition?: { from: string; to: string };
  actuatorCommands: Array<{ channel: number; state: 'ON' | 'OFF'; reason: string }>;
  alarmsRaised: string[];
  alarmsResolved: string[];
}
