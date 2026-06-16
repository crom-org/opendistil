import { ITaskGenerator, TaskDefinition } from "@opendistil/core";

export class ManualTaskGenerator implements ITaskGenerator {
  readonly name = "manual";
  private tasks: Map<string, TaskDefinition> = new Map();

  constructor(tasks?: TaskDefinition[]) {
    if (tasks) {
      for (const task of tasks) {
        this.tasks.set(task.id, task);
      }
    }
  }

  loadFromArray(tasks: TaskDefinition[]): void {
    for (const task of tasks) {
      this.tasks.set(task.id, task);
    }
  }

  async generate(count: number, _context?: Record<string, unknown>): Promise<TaskDefinition[]> {
    return Array.from(this.tasks.values()).slice(0, count);
  }

  async getTask(id: string): Promise<TaskDefinition | null> {
    return this.tasks.get(id) ?? null;
  }

  async listCategories(): Promise<string[]> {
    const categories = new Set<string>();
    for (const task of this.tasks.values()) {
      categories.add(task.category);
    }
    return Array.from(categories);
  }
}
