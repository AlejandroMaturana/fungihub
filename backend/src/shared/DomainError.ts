export abstract class DomainError {
  abstract readonly code: string;
  abstract readonly message: string;

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      name: this.constructor.name,
    };
  }
}
