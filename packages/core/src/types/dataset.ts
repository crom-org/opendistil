import { Trajectory } from "./trajectory.js";

export interface DatasetRecord {
  trajectory: Trajectory;
  derivedFormats: {
    openai: unknown | null;
    anthropic: unknown | null;
    sharegpt: unknown | null;
    jsonl: unknown | null;
  };
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  version: string;
  records: DatasetRecord[];
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  createdAt: string;
  frameworkVersion: string;
  model: {
    id: string;
    provider: string;
    reasoningLevel: string;
  };
  statistics: {
    totalRecords: number;
    totalTurns: number;
    totalToolCalls: number;
    totalDurationMs: number;
    averageTurnsPerRecord: number;
    averageToolCallsPerRecord: number;
    averageDurationPerRecord: number;
    successRate: number;
    toolCallSuccessRate: number;
  };
  execution: {
    environmentType: string;
    environmentImage: string;
    totalTasks: number;
    failedTasks: number;
    timeoutTasks: number;
    startTime: string;
    endTime: string;
  };
  tools: {
    available: ToolDefinition[];
    used: Array<{
      name: string;
      callCount: number;
      successCount: number;
      averageDurationMs: number;
    }>;
  };
  distribution: {
    byCategory: Record<string, number>;
    byDifficulty: Record<string, number>;
    byStatus: Record<string, number>;
    byToolCount: Record<string, number>;
  };
  tags: string[];
  taskCategories: string[];
  lineage: {
    parentDatasetId: string | null;
    derivedFrom: string | null;
    generationConfig: Record<string, unknown>;
  };
}

import { ToolDefinition } from "./trajectory.js";
