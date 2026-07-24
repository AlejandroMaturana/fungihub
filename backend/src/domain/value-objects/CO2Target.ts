import { Result, Ok, Err } from '../../shared/index.js';

export class CO2Target {
  private constructor(
    readonly min: number,
    readonly max: number,
  ) {}

  static create(min: number, max: number): Result<CO2Target, string> {
    if (min > max) return Err(`min (${min}) cannot be greater than max (${max})`);
    if (min < 0) return Err(`min (${min}) cannot be negative`);
    if (max > 10000) return Err(`max (${max}) out of valid range [0, 10000]`);
    return Ok(new CO2Target(min, max));
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
    return { min: this.min, max: this.max, unit: 'ppm' };
  }
}
