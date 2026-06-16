import { ITaskGenerator, TaskDefinition } from "@opendistil/core";
import { randomUUID } from "crypto";

export class AITaskGenerator implements ITaskGenerator {
  readonly name = "ai";

  async generate(count: number, context?: Record<string, unknown>): Promise<TaskDefinition[]> {
    const category = (context?.category as string) ?? "general";
    const tools = (context?.tools as string[]) ?? ["calculator"];

    const tasks: TaskDefinition[] = [];
    for (let i = 0; i < count; i++) {
      tasks.push({
        id: `ai-task-${randomUUID().slice(0, 8)}`,
        description: `AI-generated task ${i + 1} in category "${category}"`,
        category,
        difficulty: "medium",
        toolsRequired: tools,
        expectedTools: tools,
        maxTurns: 10,
        timeoutMs: 120_000,
        tags: ["ai-generated", category],
      });
    }

    return tasks;
  }

  async getTask(id: string): Promise<TaskDefinition | null> {
    return {
      id,
      description: `AI-generated task ${id}`,
      category: "general",
      difficulty: "medium",
      toolsRequired: ["calculator"],
      expectedTools: ["calculator"],
      maxTurns: 10,
      timeoutMs: 120_000,
      tags: ["ai-generated"],
    };
  }

  async listCategories(): Promise<string[]> {
    return ["general", "math", "coding", "reasoning"];
  }
}
