export interface TaskDefinition {
  id: string;
  description: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  toolsRequired: string[];
  expectedTools: string[];
  maxTurns: number;
  timeoutMs: number;
  tags: string[];
  repository?: {
    url: string;
    branch: string;
  };
  validation?: {
    criteria: string[];
    expectedOutput?: unknown;
  };
}

export interface ITaskGenerator {
  readonly name: string;
  generate(count: number, context?: Record<string, unknown>): Promise<TaskDefinition[]>;
  getTask(id: string): Promise<TaskDefinition | null>;
  listCategories(): Promise<string[]>;
}
