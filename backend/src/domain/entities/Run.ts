import { Result, Ok, Err, Clock } from '../../shared/index.js';
import { RunId, ChamberId, RecipeId } from '../value-objects/IDs.js';

export type RunStatus = 'ACTIVE' | 'PAUSED' | 'ABORTED' | 'COMPLETED';
export type ControlState = 'NORMAL' | 'SAFE_MODE' | 'WAITING_SENSOR' | 'OFFLINE_DEVICE' | 'EMERGENCY_STOP';

export interface RunData {
  id: RunId;
  chamberId: ChamberId;
  recipeId: RecipeId;
  status: RunStatus;
  controlState: ControlState;
  currentPhase: string;
  startedAt: Date;
  abortedAt?: Date;
  completedAt?: Date;
}

export class Run {
  private constructor(
    readonly id: RunId,
    readonly chamberId: ChamberId,
    readonly recipeId: RecipeId,
    private _status: RunStatus,
    private _controlState: ControlState,
    private _currentPhase: string,
    readonly startedAt: Date,
    private _abortedAt?: Date,
    private _completedAt?: Date,
  ) {}

  get status(): RunStatus { return this._status; }
  get controlState(): ControlState { return this._controlState; }
  get currentPhase(): string { return this._currentPhase; }
  get abortedAt(): Date | undefined { return this._abortedAt; }
  get completedAt(): Date | undefined { return this._completedAt; }

  static create(data: RunData): Run {
    return new Run(
      data.id,
      data.chamberId,
      data.recipeId,
      data.status,
      data.controlState,
      data.currentPhase,
      data.startedAt,
      data.abortedAt,
      data.completedAt,
    );
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  canAbort(): boolean {
    return this._status === 'ACTIVE' || this._status === 'PAUSED';
  }

  abort(clock: Clock): Result<void, string> {
    if (!this.canAbort()) {
      return Err(`Cannot abort run in status ${this._status}`);
    }
    this._status = 'ABORTED';
    this._abortedAt = clock.now();
    return Ok(undefined);
  }

  complete(clock: Clock): Result<void, string> {
    if (this._status !== 'ACTIVE') {
      return Err(`Cannot complete run in status ${this._status}`);
    }
    this._status = 'COMPLETED';
    this._completedAt = clock.now();
    return Ok(undefined);
  }

  transitionPhase(newPhase: string): Result<void, string> {
    if (this._status !== 'ACTIVE') {
      return Err(`Cannot transition phase in status ${this._status}`);
    }
    this._currentPhase = newPhase;
    return Ok(undefined);
  }

  setControlState(state: ControlState): void {
    this._controlState = state;
  }

  toData(): RunData {
    return {
      id: this.id,
      chamberId: this.chamberId,
      recipeId: this.recipeId,
      status: this._status,
      controlState: this._controlState,
      currentPhase: this._currentPhase,
      startedAt: this.startedAt,
      abortedAt: this._abortedAt,
      completedAt: this._completedAt,
    };
  }
}
