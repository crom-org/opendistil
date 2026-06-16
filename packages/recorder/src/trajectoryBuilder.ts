import {
  AgentStartEvent,
  AgentEndEvent,
  TurnStartEvent,
  TurnEndEvent,
  MessageStartEvent,
  MessageEndEvent,
  ToolExecutionStartEvent,
  ToolExecutionUpdateEvent,
  Trajectory,
  Turn,
  Message,
  ToolCall,
  ExecutionStep,
  RecorderConfig,
} from "@opendistil/core";

interface SessionState {
  agentId: string;
  startTime: string;
  modelId: string;
}

interface TurnState {
  id: string;
  index: number;
  startTime: string;
  userMessage?: Message;
  assistantMessage?: Message;
}

interface MessageState {
  id: string;
  role: "user" | "assistant" | "system" | "tool_result";
  startTime: string;
}

interface ToolCallState {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  startTime: string;
  status: "running" | "success" | "error";
}

export class TrajectoryBuilder {
  private currentSession: SessionState | null = null;
  private currentTurn: TurnState | null = null;
  private currentMessage: MessageState | null = null;
  private pendingToolCalls: Map<string, ToolCallState> = new Map();
  private completedToolCalls: ToolCall[] = [];
  private unsubscribeFns: Array<() => void> = [];

  private events: unknown[] = [];
  private turns: Turn[] = [];
  private messages: Message[] = [];
  private steps: ExecutionStep[] = [];
  private config: RecorderConfig;

  constructor(config: RecorderConfig) {
    this.config = config;
  }

  setUnsubscribeFns(fns: Array<() => void>): void {
    this.unsubscribeFns = fns;
  }

  startSession(event: AgentStartEvent): void {
    this.currentSession = {
      agentId: event.agentId,
      startTime: event.timestamp,
      modelId: event.modelId,
    };
    this.events = [];
    this.turns = [];
    this.messages = [];
    this.steps = [];
    this.pendingToolCalls.clear();
    this.completedToolCalls = [];

    if (this.config.captureRawEvents) {
      this.events.push(event);
    }
  }

  endSession(_event: AgentEndEvent): void {
    // Final metadata is captured in build()
  }

  beginTurn(event: TurnStartEvent): void {
    this.currentTurn = {
      id: event.turnId,
      index: event.turnIndex,
      startTime: event.timestamp,
    };
  }

  endTurn(event: TurnEndEvent): void {
    if (!this.currentTurn) return;

    const turn: Turn = {
      id: this.currentTurn.id,
      index: this.currentTurn.index,
      userMessage: this.currentTurn.userMessage!,
      assistantMessage: this.currentTurn.assistantMessage!,
      toolResults: this.completedToolCalls.filter(
        (tc) => new Date(tc.endTime) >= new Date(this.currentTurn!.startTime),
      ),
      startTime: this.currentTurn.startTime,
      endTime: event.timestamp,
      durationMs:
        new Date(event.timestamp).getTime() -
        new Date(this.currentTurn.startTime).getTime(),
    };

    this.turns.push(turn);
    this.steps.push({
      type: "turn",
      data: turn,
      timestamp: event.timestamp,
    });

    this.currentTurn = null;
  }

  beginMessage(event: MessageStartEvent): void {
    this.currentMessage = {
      id: event.messageId,
      role: event.role,
      startTime: event.timestamp,
    };
  }

  endMessage(event: MessageEndEvent): void {
    if (!this.currentMessage) return;

    const message: Message = {
      id: this.currentMessage.id,
      role: this.currentMessage.role,
      content: event.content,
      toolCalls: [],
      timestamp: this.currentMessage.startTime,
      metadata: {},
    };

    this.messages.push(message);
    this.steps.push({
      type: "message",
      data: message,
      timestamp: event.timestamp,
    });

    if (this.currentTurn) {
      if (message.role === "user") {
        this.currentTurn.userMessage = message;
      } else if (message.role === "assistant") {
        this.currentTurn.assistantMessage = message;
      }
    }

    this.currentMessage = null;
  }

  recordToolCallStart(event: ToolExecutionStartEvent | ToolCallState): void {
    const toolCall = event as ToolCallState;
    this.pendingToolCalls.set(toolCall.id, toolCall);
    this.steps.push({
      type: "tool_execution",
      data: { action: "start", toolCall },
      timestamp: toolCall.startTime,
    });
  }

  updateToolCall(event: ToolExecutionUpdateEvent): void {
    this.steps.push({
      type: "tool_execution",
      data: { action: "update", toolExecutionId: event.toolExecutionId, progress: event.progress },
      timestamp: event.timestamp,
    });
  }

  recordToolCallEnd(toolCall: ToolCall): void {
    this.pendingToolCalls.delete(toolCall.id);
    this.completedToolCalls.push(toolCall);
    this.steps.push({
      type: "tool_execution",
      data: { action: "end", toolCall },
      timestamp: toolCall.endTime,
    });
  }

  build(): Trajectory {
    return {
      metadata: {
        taskId: "",
        taskDescription: "",
        modelId: this.currentSession?.modelId ?? "",
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
        timestamp: new Date().toISOString(),
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

  cleanup(): void {
    for (const fn of this.unsubscribeFns) {
      fn();
    }
    this.unsubscribeFns = [];
  }
}
