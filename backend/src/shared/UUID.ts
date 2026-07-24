export interface UUID {
  generate(): string;
}

export class CryptoUUID implements UUID {
  generate(): string {
    return crypto.randomUUID();
  }
}

export class SequentialUUID implements UUID {
  private counter = 0;

  generate(): string {
    this.counter++;
    return `id-${this.counter}`;
  }

  reset(): void {
    this.counter = 0;
  }
}
