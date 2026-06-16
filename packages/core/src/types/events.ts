export interface AgentStartEvent {
  type: "agent_start";
  agentId: string;
  modelId: string;
  modelProvider: string;
  timestamp: string;
}

export interface AgentEndEvent {
  type: "agent_end";
  agentId: string;
  finalStatus: "success" | "failure" | "timeout" | "error";
  usage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
  };
  timestamp: string;
}

export interface TurnStartEvent {
  type: "turn_start";
  turnId: string;
  turnIndex: number;
  timestamp: string;
}

export interface TurnEndEvent {
  type: "turn_end";
  turnId: string;
  timestamp: string;
}

export interface MessageStartEvent {
  type: "message_start";
  messageId: string;
  role: "user" | "assistant" | "system" | "tool_result";
  timestamp: string;
}

export interface MessageEndEvent {
  type: "message_end";
  messageId: string;
  role: "user" | "assistant" | "system" | "tool_result";
  content: string | null;
  timestamp: string;
}

export interface ToolExecutionStartEvent {
  type: "tool_execution_start";
  toolExecutionId: string;
  toolName: string;
  args: Record<string, unknown>;
  timestamp: string;
}

export interface ToolExecutionUpdateEvent {
  type: "tool_execution_update";
  toolExecutionId: string;
  progress: unknown;
  timestamp: string;
}

export interface ToolExecutionEndEvent {
  type: "tool_execution_end";
  toolExecutionId: string;
  toolName: string;
  args?: Record<string, unknown>;
  result: unknown;
  error?: string | null;
  timestamp: string;
}

export type AgentEvent =
  | AgentStartEvent
  | AgentEndEvent
  | TurnStartEvent
  | TurnEndEvent
  | MessageStartEvent
  | MessageEndEvent
  | ToolExecutionStartEvent
  | ToolExecutionUpdateEvent
  | ToolExecutionEndEvent;

export type EventHandler = (event: AgentEvent) => void;
