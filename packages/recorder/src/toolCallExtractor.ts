import {
  ToolExecutionStartEvent,
  ToolExecutionEndEvent,
  ToolCall,
} from "@opendistil/core";

export interface ToolCallState {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  startTime: string;
  status: "running" | "success" | "error";
}

export class ToolCallExtractor {
  private toolCallTimers: Map<string, number> = new Map();

  extractStart(event: ToolExecutionStartEvent): ToolCallState {
    const now = Date.now();
    this.toolCallTimers.set(event.toolExecutionId, now);

    return {
      id: event.toolExecutionId,
      toolName: event.toolName,
      arguments: event.args,
      startTime: new Date(now).toISOString(),
      status: "running",
    };
  }

  extractEnd(event: ToolExecutionEndEvent): ToolCall {
    const startTime = this.toolCallTimers.get(event.toolExecutionId);
    const endTimestamp = Date.now();
    const durationMs = startTime ? endTimestamp - startTime : 0;
    this.toolCallTimers.delete(event.toolExecutionId);

    return {
      id: event.toolExecutionId,
      toolName: event.toolName,
      arguments: event.args ?? {},
      startTime: startTime
        ? new Date(startTime).toISOString()
        : new Date(endTimestamp).toISOString(),
      endTime: new Date(endTimestamp).toISOString(),
      durationMs,
      result: event.result,
      error: event.error ?? null,
      status: event.error ? "error" : "success",
    };
  }
}
