import { ITaskGenerator, TaskDefinition } from "@opendistil/core";
import { randomUUID } from "crypto";

export class RepoBasedTaskGenerator implements ITaskGenerator {
  readonly name = "repo-based";

  async generate(count: number, context?: Record<string, unknown>): Promise<TaskDefinition[]> {
    const repoUrl = (context?.repoUrl as string) ?? "https://github.com/example/repo";
    const branch = (context?.branch as string) ?? "main";

    return Array.from({ length: count }, (_, i) => ({
      id: `repo-task-${randomUUID().slice(0, 8)}`,
      description: `Repository-based task ${i + 1}`,
      category: "software-engineering",
      difficulty: "hard" as const,
      toolsRequired: ["file_editor", "bash", "grep"],
      expectedTools: ["file_editor", "bash", "grep"],
      maxTurns: 30,
      timeoutMs: 600_000,
      tags: ["repo-based", "software-engineering"],
      repository: {
        url: repoUrl,
        branch,
      },
    }));
  }

  async getTask(id: string): Promise<TaskDefinition | null> {
    return {
      id,
      description: `Repository-based task ${id}`,
      category: "software-engineering",
      difficulty: "hard",
      toolsRequired: ["file_editor", "bash", "grep"],
      expectedTools: ["file_editor", "bash", "grep"],
      maxTurns: 30,
      timeoutMs: 600_000,
      tags: ["repo-based"],
    };
  }

  async listCategories(): Promise<string[]> {
    return ["software-engineering", "bug-fixing", "feature-implementation"];
  }
}
