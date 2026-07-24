import { Result, Ok, Err } from '../../shared/index.js';

export class HumidityRange {
  private constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  static create(min: number, max: number): Result<HumidityRange, string> {
    if (min > max) return Err(`min (${min}) cannot be greater than max (${max})`);
    if (min < 0 || min > 100) return Err(`min (${min}) out of valid range [0, 100]`);
    if (max < 0 || max > 100) return Err(`max (${max}) out of valid range [0, 100]`);
    return Ok(new HumidityRange(min, max));
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
    return { min: this.min, max: this.max, unit: '%' };
  }
}
