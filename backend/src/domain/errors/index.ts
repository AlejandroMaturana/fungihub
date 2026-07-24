import { DomainError } from '../../shared/index.js';

export class RunNotAbortable extends DomainError {
  readonly code = 'RUN_NOT_ABORTABLE';
  constructor(readonly message: string) { super(); }
}

export class RunNotCompletable extends DomainError {
  readonly code = 'RUN_NOT_COMPLETABLE';
  constructor(readonly message: string) { super(); }
}

export class ChamberNotFound extends DomainError {
  readonly code = 'CHAMBER_NOT_FOUND';
  constructor(readonly message: string) { super(); }
}

export class RecipeNotFound extends DomainError {
  readonly code = 'RECIPE_NOT_FOUND';
  constructor(readonly message: string) { super(); }
}

export class RecipeWithoutPhases extends DomainError {
  readonly code = 'RECIPE_WITHOUT_PHASES';
  constructor(readonly message: string) { super(); }
}

export class TelemetryValidationFailed extends DomainError {
  readonly code = 'TELEMETRY_VALIDATION_FAILED';
  constructor(readonly message: string) { super(); }
}

export class ChamberAlreadyHasActiveRun extends DomainError {
  readonly code = 'CHAMBER_ALREADY_HAS_ACTIVE_RUN';
  constructor(readonly message: string) { super(); }
}
