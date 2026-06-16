import { IEnvironmentProvider, TaskDefinition, Trajectory } from "@opendistil/core";
import { Recorder } from "@opendistil/recorder";

export interface RunnerConfig {
  maxConcurrent: number;
  defaultTimeoutMs: number;
}

export interface ExecutionResult {
  taskId: string;
  trajectory: Trajectory | null;
  error: string | null;
  durationMs: number;
}

export class Runner {
  private config: RunnerConfig;

  constructor(config?: Partial<RunnerConfig>) {
    this.config = {
      maxConcurrent: 1,
      defaultTimeoutMs: 300_000,
      ...config,
    };
  }

  async execute(
    task: TaskDefinition,
    _environmentProvider: IEnvironmentProvider,
    _environmentId: string,
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const recorder = new Recorder();

    try {
      // Placeholder: In production, this would:
      // 1. Create an agent session via Pi SDK
      // 2. Attach recorder to the runtime
      // 3. Execute the task
      // 4. Build trajectory from recorded events

      const trajectory = await recorder.buildTrajectory();

      return {
        taskId: task.id,
        trajectory,
        error: null,
        durationMs: Date.now() - startTime,
      };
    } catch (err) {
      return {
        taskId: task.id,
        trajectory: null,
        error: (err as Error).message,
        durationMs: Date.now() - startTime,
      };
    }
  }

  async executeBatch(
    tasks: TaskDefinition[],
    environmentProvider: IEnvironmentProvider,
    environmentId: string,
  ): Promise<ExecutionResult[]> {
    const results: ExecutionResult[] = [];

    for (let i = 0; i < tasks.length; i += this.config.maxConcurrent) {
      const batch = tasks.slice(i, i + this.config.maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((task) => this.execute(task, environmentProvider, environmentId)),
      );
      results.push(...batchResults);
    }

    return results;
  }
}
