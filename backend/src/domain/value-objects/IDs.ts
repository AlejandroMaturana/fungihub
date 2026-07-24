export class RunId {
  private constructor(readonly value: string) {}

  static create(value: string): RunId {
    return new RunId(value);
  }

  equals(other: RunId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class ChamberId {
  private constructor(readonly value: string) {}

  static create(value: string): ChamberId {
    return new ChamberId(value);
  }

  equals(other: ChamberId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

export class RecipeId {
  private constructor(readonly value: string) {}

  static create(value: string): RecipeId {
    return new RecipeId(value);
  }

  equals(other: RecipeId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
