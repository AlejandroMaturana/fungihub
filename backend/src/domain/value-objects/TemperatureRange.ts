import { Result, Ok, Err } from '../../shared/index.js';

export class TemperatureRange {
  private constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  static create(min: number, max: number): Result<TemperatureRange, string> {
    if (min > max) return Err(`min (${min}) cannot be greater than max (${max})`);
    if (min < -10 || min > 50) return Err(`min (${min}) out of valid range [-10, 50]`);
    if (max < -10 || max > 50) return Err(`max (${max}) out of valid range [-10, 50]`);
    return Ok(new TemperatureRange(min, max));
  }

  contains(value: number): boolean {
    return value >= this.min && value <= this.max;
  }

  isAbove(value: number): boolean {
    return value > this.max;
  }

  isBelow(value: number): boolean {
    return value < this.min;
  }

  toJSON() {
    return { min: this.min, max: this.max, unit: '°C' };
  }
}
