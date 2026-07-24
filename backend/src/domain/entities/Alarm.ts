import { RunId } from '../value-objects/IDs.js';

export type AlarmSeverity = 'INFO' | 'WARNING' | 'CRITICAL';
export type AlarmStatus = 'ACTIVE' | 'RESOLVED';

export interface AlarmData {
  id?: string;
  runId: RunId;
  type: string;
  severity: AlarmSeverity;
  message: string;
  status: AlarmStatus;
  raisedAt: Date;
  resolvedAt?: Date;
}

export class Alarm {
  private constructor(
    readonly id: string | undefined,
    readonly runId: RunId,
    readonly type: string,
    private _severity: AlarmSeverity,
    readonly message: string,
    private _status: AlarmStatus,
    readonly raisedAt: Date,
    private _resolvedAt?: Date,
  ) {}

  get severity(): AlarmSeverity { return this._severity; }
  get status(): AlarmStatus { return this._status; }
  get resolvedAt(): Date | undefined { return this._resolvedAt; }

  static create(data: AlarmData): Alarm {
    return new Alarm(
      data.id,
      data.runId,
      data.type,
      data.severity,
      data.message,
      data.status,
      data.raisedAt,
      data.resolvedAt,
    );
  }

  isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  resolve(resolvedAt: Date): void {
    this._status = 'RESOLVED';
    this._resolvedAt = resolvedAt;
  }

  toData(): AlarmData {
    return {
      id: this.id,
      runId: this.runId,
      type: this.type,
      severity: this._severity,
      message: this.message,
      status: this._status,
      raisedAt: this.raisedAt,
      resolvedAt: this._resolvedAt,
    };
  }
}
