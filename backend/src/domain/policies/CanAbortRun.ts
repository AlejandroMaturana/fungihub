import { Result, Ok, Err } from '../../shared/index.js';
import { Run } from '../entities/Run.js';
import { RunNotAbortable } from '../errors/index.js';

export class CanAbortRun {
  evaluate(run: Run): Result<void, RunNotAbortable> {
    if (!run.canAbort()) {
      return Err(new RunNotAbortable(
        `Cannot abort run in status ${run.status}`,
      ));
    }
    return Ok(undefined);
  }
}
