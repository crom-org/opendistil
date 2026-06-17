import { ToolCall } from "@opendistil/core";

export interface ToolCallState {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  startTime: string;
  status: "running" | "success" | "error";
}

export class ToolCallExtractor {
  private toolCallTimers: Map<string, number> = new Map();

  extractStart(toolCallId: string, toolName: string, args: unknown): ToolCallState {
    const now = Date.now();
    this.toolCallTimers.set(toolCallId, now);

    return {
      id: toolCallId,
      toolName,
      arguments: (args as Record<string, unknown>) ?? {},
      startTime: new Date(now).toISOString(),
      status: "running",
    };
  }

  extractEnd(
    toolCallId: string,
    toolName: string,
    result: unknown,
    isError: boolean,
  ): ToolCall {
    const startTime = this.toolCallTimers.get(toolCallId);
    const endTimestamp = Date.now();
    const durationMs = startTime ? endTimestamp - startTime : 0;
    this.toolCallTimers.delete(toolCallId);

    return {
      id: toolCallId,
      toolName,
      arguments: {},
      startTime: startTime
        ? new Date(startTime).toISOString()
        : new Date(endTimestamp).toISOString(),
      endTime: new Date(endTimestamp).toISOString(),
      durationMs,
      result,
      error: isError ? (result as string) ?? "Tool execution error" : null,
      status: isError ? "error" : "success",
    };
  }
}
