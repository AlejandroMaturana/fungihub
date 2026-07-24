import { Result } from '../../shared/index.js';
import { Run } from '../entities/Run.js';
import { Chamber } from '../entities/Chamber.js';
import { Telemetry } from '../entities/Telemetry.js';
import { Alarm } from '../entities/Alarm.js';

export interface RunRepository {
  findById(id: string): Promise<Run | null>;
  findByChamberId(chamberId: string): Promise<Run | null>;
  findActiveRuns(): Promise<Run[]>;
  save(run: Run): Promise<void>;
}

export interface ChamberRepository {
  findById(id: string): Promise<Chamber | null>;
  findByDeviceId(deviceId: string): Promise<Chamber | null>;
  findAll(): Promise<Chamber[]>;
  save(chamber: Chamber): Promise<void>;
}

export interface RecipeRepository {
  findById(id: string): Promise<import('../entities/Recipe.js').Recipe | null>;
  findAll(): Promise<import('../entities/Recipe.js').Recipe[]>;
  save(recipe: import('../entities/Recipe.js').Recipe): Promise<void>;
}

export interface TelemetryRepository {
  save(telemetry: Telemetry): Promise<void>;
  findLatestByRunId(runId: string): Promise<Telemetry | null>;
  findByRunIdAndTimeRange(runId: string, from: Date, to: Date): Promise<Telemetry[]>;
}

export interface AlarmRepository {
  save(alarm: Alarm): Promise<void>;
  findActiveByRunId(runId: string): Promise<Alarm[]>;
  findByRunId(runId: string): Promise<Alarm[]>;
  resolve(alarmId: string, resolvedAt: Date): Promise<void>;
}
