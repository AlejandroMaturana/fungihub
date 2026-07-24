import { Result, Ok, Err, EventBus, UUID, Clock } from '../../shared/index.js';
import { Run, RunId, ChamberId, RecipeId, RunRepository, ChamberRepository, RecipeRepository, CanStartRun, ChamberAlreadyHasActiveRun } from '../../domain/index.js';
import { createRunStartedEvent } from '../../domain/index.js';

export interface StartRunInput {
  chamberId: string;
  recipeId: string;
}

export class StartRun {
  constructor(
    private runRepo: RunRepository,
    private chamberRepo: ChamberRepository,
    private recipeRepo: RecipeRepository,
    private eventBus: EventBus,
    private uuid: UUID,
    private clock: Clock,
  ) {}

  async execute(input: StartRunInput): Promise<Result<Run, ChamberAlreadyHasActiveRun | Error>> {
    const chamber = await this.chamberRepo.findByDeviceId(input.chamberId);
    if (!chamber) {
      return Err(new Error(`Chamber not found for device ${input.chamberId}`));
    }

    const recipe = await this.recipeRepo.findById(input.recipeId);
    if (!recipe) {
      return Err(new Error(`Recipe not found: ${input.recipeId}`));
    }

    const activeRuns = await this.runRepo.findActiveRuns();
    const policy = new CanStartRun();
    const policyResult = policy.evaluate(activeRuns, chamber.id.value);
    if (policyResult.isErr()) {
      return Err(policyResult.error);
    }

    const run = Run.create({
      id: RunId.create(this.uuid.generate()),
      chamberId: chamber.id,
      recipeId: recipe.id,
      status: 'ACTIVE',
      controlState: 'NORMAL',
      currentPhase: recipe.getFirstPhase().name,
      startedAt: this.clock.now(),
    });

    await this.runRepo.save(run);

    this.eventBus.publish(createRunStartedEvent(
      run.id,
      run.chamberId,
      run.recipeId,
    ));

    return Ok(run);
  }
}
