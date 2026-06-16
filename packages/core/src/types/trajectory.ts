export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  startTime: string;
  endTime: string;
  durationMs: number;
  result: unknown;
  error: string | null;
  status: "success" | "error" | "timeout";
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system" | "tool_result";
  content: string | null;
  toolCalls: ToolCall[];
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface Turn {
  id: string;
  index: number;
  userMessage: Message;
  assistantMessage: Message;
  toolResults: ToolCall[];
  startTime: string;
  endTime: string;
  durationMs: number;
}

export interface ExecutionStep {
  type: "thinking" | "tool_execution" | "message" | "turn";
  data: unknown;
  timestamp: string;
}

export interface TrajectoryMetadata {
  taskId: string;
  taskDescription: string;
  modelId: string;
  modelProvider: string;
  reasoningLevel: string;
  environmentId: string;
  environmentType: string;
  toolsAvailable: ToolDefinition[];
  toolsUsed: string[];
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  totalDurationMs: number;
  turnCount: number;
  toolCallCount: number;
  successRate: number;
  finalStatus: "success" | "failure" | "timeout" | "error";
  repositoryUrl: string | null;
  taskCategory: string | null;
  timestamp: string;
  agentVersion: string;
  frameworkVersion: string;
  parentTrajectoryId: string | null;
  branchLabel: string | null;
}

export interface Trajectory {
  metadata: TrajectoryMetadata;
  turns: Turn[];
  messages: Message[];
  steps: ExecutionStep[];
  rawEvents: unknown[];
  tags: string[];
  score: number | null;
}
