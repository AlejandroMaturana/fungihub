export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class FixedClock implements Clock {
  private _now: Date;

  constructor(initialDate: Date) {
    this._now = initialDate;
  }

  now(): Date {
    return this._now;
  }

  advance(ms: number): void {
    this._now = new Date(this._now.getTime() + ms);
  }

  set(date: Date): void {
    this._now = date;
  }
}
