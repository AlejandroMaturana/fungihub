import { Result, Ok, Err } from '../../shared/index.js';
import { Run } from '../entities/Run.js';
import { ChamberAlreadyHasActiveRun } from '../errors/index.js';

export class CanStartRun {
  evaluate(activeRuns: Run[], chamberId: string): Result<void, ChamberAlreadyHasActiveRun> {
    const hasActive = activeRuns.some(r => r.chamberId.value === chamberId);
    if (hasActive) {
      return Err(new ChamberAlreadyHasActiveRun(
        `Chamber ${chamberId} already has an active run`,
      ));
    }
    return Ok(undefined);
  }
}
