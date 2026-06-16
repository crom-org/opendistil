import { ITaskGenerator, TaskDefinition } from "@opendistil/core";
import { randomUUID } from "crypto";

interface BenchmarkConfig {
  name: string;
  tasks: TaskDefinition[];
}

export class BenchmarkTaskGenerator implements ITaskGenerator {
  readonly name = "benchmark";
  private benchmarks: Map<string, BenchmarkConfig> = new Map();

  registerBenchmark(name: string, tasks: TaskDefinition[]): void {
    this.benchmarks.set(name, { name, tasks });
  }

  async generate(count: number, context?: Record<string, unknown>): Promise<TaskDefinition[]> {
    const benchmarkName = (context?.benchmark as string) ?? "default";
    const benchmark = this.benchmarks.get(benchmarkName);

    if (benchmark) {
      return benchmark.tasks.slice(0, count);
    }

    return Array.from({ length: count }, (_, i) => ({
      id: `benchmark-${randomUUID().slice(0, 8)}`,
      description: `Benchmark task ${i + 1} from "${benchmarkName}"`,
      category: "benchmark",
      difficulty: "medium" as const,
      toolsRequired: [],
      expectedTools: [],
      maxTurns: 20,
      timeoutMs: 300_000,
      tags: ["benchmark", benchmarkName],
    }));
  }

  async getTask(id: string): Promise<TaskDefinition | null> {
    for (const benchmark of this.benchmarks.values()) {
      const task = benchmark.tasks.find((t) => t.id === id);
      if (task) return task;
    }
    return null;
  }

  async listCategories(): Promise<string[]> {
    return Array.from(this.benchmarks.keys());
  }
}
