import { TaskDefinition, Trajectory } from "@opendistil/core";
import { ExecutionResult } from "./runner.js";

export interface ExecutionPlan {
  tasks: TaskDefinition[];
  config: {
    maxConcurrent: number;
    timeoutMs: number;
  };
}

export interface ExecutionReport {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  totalDurationMs: number;
  results: ExecutionResult[];
}

export class ExecutionController {
  async executePlan(
    plan: ExecutionPlan,
    executeFn: (task: TaskDefinition) => Promise<ExecutionResult>,
  ): Promise<ExecutionReport> {
    const startTime = Date.now();
    const results: ExecutionResult[] = [];

    for (let i = 0; i < plan.tasks.length; i += plan.config.maxConcurrent) {
      const batch = plan.tasks.slice(i, i + plan.config.maxConcurrent);
      const batchResults = await Promise.all(
        batch.map((task) => executeFn(task)),
      );
      results.push(...batchResults);
    }

    const successfulTasks = results.filter((r) => r.error === null).length;
    const failedTasks = results.filter((r) => r.error !== null).length;

    return {
      totalTasks: plan.tasks.length,
      successfulTasks,
      failedTasks,
      totalDurationMs: Date.now() - startTime,
      results,
    };
  }

  static calculateMetrics(trajectories: Trajectory[]): {
    totalTurns: number;
    totalToolCalls: number;
    averageTurns: number;
    averageToolCalls: number;
    successRate: number;
  } {
    const totalTurns = trajectories.reduce(
      (sum, t) => sum + (t.metadata?.turnCount ?? t.turns.length),
      0,
    );
    const totalToolCalls = trajectories.reduce(
      (sum, t) => sum + (t.metadata?.toolCallCount ?? 0),
      0,
    );
    const total = trajectories.length;

    return {
      totalTurns,
      totalToolCalls,
      averageTurns: total > 0 ? totalTurns / total : 0,
      averageToolCalls: total > 0 ? totalToolCalls / total : 0,
      successRate:
        total > 0
          ? trajectories.filter((t) => t.metadata?.finalStatus === "success").length / total
          : 0,
    };
  }
}
