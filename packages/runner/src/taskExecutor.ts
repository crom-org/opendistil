import { TaskDefinition } from "@opendistil/core";

export interface TaskExecutionHooks {
  onTaskStart?: (task: TaskDefinition) => void;
  onTaskComplete?: (task: TaskDefinition, durationMs: number) => void;
  onTaskError?: (task: TaskDefinition, error: string) => void;
}

export class TaskExecutor {
  private hooks: TaskExecutionHooks;

  constructor(hooks?: TaskExecutionHooks) {
    this.hooks = hooks ?? {};
  }

  async executeTask(
    task: TaskDefinition,
    executeFn: (task: TaskDefinition) => Promise<void>,
  ): Promise<void> {
    const startTime = Date.now();
    this.hooks.onTaskStart?.(task);

    try {
      await executeFn(task);
      this.hooks.onTaskComplete?.(task, Date.now() - startTime);
    } catch (err) {
      this.hooks.onTaskError?.(task, (err as Error).message);
      throw err;
    }
  }

  async executeBatch(
    tasks: TaskDefinition[],
    executeFn: (task: TaskDefinition) => Promise<void>,
    concurrency: number = 1,
  ): Promise<void> {
    for (let i = 0; i < tasks.length; i += concurrency) {
      const batch = tasks.slice(i, i + concurrency);
      await Promise.all(
        batch.map((task) => this.executeTask(task, executeFn)),
      );
    }
  }
}
