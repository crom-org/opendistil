import {
  Trajectory,
  Turn,
  Message,
  ToolCall,
  ExecutionStep,
} from "@opendistil/core";

interface PiMessage {
  id?: string;
  role: string;
  content?: unknown;
}

interface PiToolResult {
  toolCallId?: string;
  toolName?: string;
  result?: unknown;
  isError?: boolean;
}

interface PiAssistantMessageEvent {
  type?: string;
  delta?: string;
  text?: string;
}

interface TurnState {
  id: string;
  index: number;
  startTime: string;
  userMessage?: Message;
  assistantMessage?: Message;
}

export class TrajectoryBuilder {
  private sessionStartTime: string = "";
  private currentTurn: TurnState | null = null;
  private pendingToolCalls: Map<string, ToolCallState> = new Map();
  private completedToolCalls: ToolCall[] = [];

  private events: unknown[] = [];
  private turns: Turn[] = [];
  private messages: Message[] = [];
  private steps: ExecutionStep[] = [];
  private turnIndex: number = 0;

  constructor() {
  }

  startSession(): void {
    this.sessionStartTime = new Date().toISOString();
    this.events = [];
    this.turns = [];
    this.messages = [];
    this.steps = [];
    this.pendingToolCalls.clear();
    this.completedToolCalls = [];
    this.turnIndex = 0;
    this.currentTurn = null;
  }

  endSession(_messages: PiMessage[]): void {
  }

  beginTurn(): void {
    this.currentTurn = {
      id: `turn-${this.turnIndex}`,
      index: this.turnIndex,
      startTime: new Date().toISOString(),
    };
  }

  endTurn(message: PiMessage, _toolResults: PiToolResult[]): void {
    if (!this.currentTurn) return;

    const assistantMsg = this.mapPiMessage(message);
    assistantMsg.role = "assistant";

    const turn: Turn = {
      id: this.currentTurn.id,
      index: this.currentTurn.index,
      userMessage: this.currentTurn.userMessage ?? this.createEmptyMessage("user"),
      assistantMessage: assistantMsg,
      toolResults: [...this.completedToolCalls],
      startTime: this.currentTurn.startTime,
      endTime: new Date().toISOString(),
      durationMs:
        new Date().getTime() - new Date(this.currentTurn.startTime).getTime(),
    };

    this.turns.push(turn);
    this.steps.push({
      type: "turn",
      data: turn,
      timestamp: new Date().toISOString(),
    });

    this.turnIndex++;
    this.currentTurn = null;
  }

  beginMessage(message: PiMessage): void {
    const msg = this.mapPiMessage(message);

    if (msg.role === "user" && this.currentTurn) {
      this.currentTurn.userMessage = msg;
    }

    this.messages.push(msg);
    this.steps.push({
      type: "message",
      data: msg,
      timestamp: new Date().toISOString(),
    });
  }

  updateMessage(_message: PiMessage, _assistantMessageEvent: PiAssistantMessageEvent): void {
  }

  endMessage(_message: PiMessage): void {
  }

  recordToolCallStart(
    toolCallId: string,
    toolName: string,
    args: unknown,
  ): void {
    const now = new Date().toISOString();
    const state: ToolCallState = {
      id: toolCallId,
      toolName,
      arguments: args as Record<string, unknown>,
      startTime: now,
      status: "running",
    };
    this.pendingToolCalls.set(toolCallId, state);

    this.steps.push({
      type: "tool_execution",
      data: { action: "start", toolCall: state },
      timestamp: now,
    });
  }

  updateToolCall(toolCallId: string, _partialResult: unknown): void {
    this.steps.push({
      type: "tool_execution",
      data: { action: "update", toolCallId },
      timestamp: new Date().toISOString(),
    });
  }

  recordToolCallEnd(
    toolCallId: string,
    toolName: string,
    result: unknown,
    isError: boolean,
  ): void {
    const now = new Date().toISOString();
    const state = this.pendingToolCalls.get(toolCallId);
    const durationMs = state
      ? new Date().getTime() - new Date(state.startTime).getTime()
      : 0;

    const toolCall: ToolCall = {
      id: toolCallId,
      toolName,
      arguments: (state?.arguments as Record<string, unknown>) ?? {},
      startTime: state?.startTime ?? now,
      endTime: now,
      durationMs,
      result,
      error: isError ? (result as string) ?? "Tool execution error" : null,
      status: isError ? "error" : "success",
    };

    this.pendingToolCalls.delete(toolCallId);
    this.completedToolCalls.push(toolCall);

    this.steps.push({
      type: "tool_execution",
      data: { action: "end", toolCall },
      timestamp: now,
    });
  }

  build(): Trajectory {
    return {
      metadata: {
        taskId: "",
        taskDescription: "",
        modelId: "",
        modelProvider: "",
        reasoningLevel: "",
        environmentId: "",
        environmentType: "",
        toolsAvailable: [],
        toolsUsed: [],
        totalTokens: 0,
        promptTokens: 0,
        completionTokens: 0,
        totalDurationMs: 0,
        turnCount: this.turns.length,
        toolCallCount: this.completedToolCalls.length,
        successRate: 0,
        finalStatus: "success",
        repositoryUrl: null,
        taskCategory: null,
        timestamp: this.sessionStartTime || new Date().toISOString(),
        agentVersion: "",
        frameworkVersion: "",
        parentTrajectoryId: null,
        branchLabel: null,
      },
      turns: this.turns,
      messages: this.messages,
      steps: this.steps,
      rawEvents: this.events,
      tags: [],
      score: null,
    };
  }

  private mapPiMessage(message: PiMessage): Message {
    const role = this.mapPiRole(message.role);
    const content = this.extractTextContent(message.content);

    return {
      id: message.id ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      role,
      content,
      toolCalls: [],
      timestamp: new Date().toISOString(),
      metadata: {},
    };
  }

  private mapPiRole(
    role: string,
  ): "user" | "assistant" | "system" | "tool_result" {
    switch (role) {
      case "user": return "user";
      case "assistant": return "assistant";
      case "system": return "system";
      default: return "tool_result";
    }
  }

  private extractTextContent(content: unknown): string | null {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .map((part) => {
          if (typeof part === "object" && part !== null) {
            const p = part as Record<string, unknown>;
            if (p.type === "text") return p.text as string;
          }
          return "";
        })
        .filter(Boolean)
        .join("\n") || null;
    }
    return null;
  }

  private createEmptyMessage(role: "user" | "assistant" | "system" | "tool_result"): Message {
    return {
      id: `empty-${Date.now()}`,
      role,
      content: null,
      toolCalls: [],
      timestamp: new Date().toISOString(),
      metadata: {},
    };
  }
}

interface ToolCallState {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  startTime: string;
  status: "running" | "success" | "error";
}
