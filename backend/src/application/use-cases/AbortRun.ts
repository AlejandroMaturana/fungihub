import { Result, Ok, Err, EventBus, Clock } from '../../shared/index.js';
import { Run, RunRepository, CanAbortRun } from '../../domain/index.js';
import { createRunAbortedEvent } from '../../domain/index.js';

export interface AbortRunInput {
  runId: string;
  reason?: string;
}

export class AbortRun {
  constructor(
    private runRepo: RunRepository,
    private eventBus: EventBus,
    private clock: Clock,
  ) {}

  async execute(input: AbortRunInput): Promise<Result<Run, Error>> {
    const run = await this.runRepo.findById(input.runId);
    if (!run) {
      return Err(new Error(`Run not found: ${input.runId}`));
    }

    const policy = new CanAbortRun();
    const policyResult = policy.evaluate(run);
    if (policyResult.isErr()) {
      return Err(new Error(policyResult.error.message));
    }

    const abortResult = run.abort(this.clock);
    if (abortResult.isErr()) {
      return Err(new Error(abortResult.error));
    }

    await this.runRepo.save(run);

    this.eventBus.publish(createRunAbortedEvent(run.id, input.reason));

    return Ok(run);
  }
}
