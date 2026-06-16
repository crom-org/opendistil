import {
  RecorderConfig,
  Trajectory,
  AgentStartEvent,
  AgentEndEvent,
  TurnStartEvent,
  TurnEndEvent,
  MessageStartEvent,
  MessageEndEvent,
  ToolExecutionStartEvent,
  ToolExecutionUpdateEvent,
  ToolExecutionEndEvent,
} from "@opendistil/core";
import { TrajectoryBuilder } from "./trajectoryBuilder";
import { MetadataCollector } from "./metadataCollector";
import { ToolCallExtractor } from "./toolCallExtractor";

export class Recorder {
  private trajectoryBuilder: TrajectoryBuilder;
  private metadataCollector: MetadataCollector;
  private toolCallExtractor: ToolCallExtractor;
  private config: RecorderConfig;

  constructor(config?: Partial<RecorderConfig>) {
    this.config = {
      captureRawEvents: true,
      captureIntermediateSteps: true,
      maxToolCallDurationMs: 300_000,
      ...config,
    };
    this.trajectoryBuilder = new TrajectoryBuilder(this.config);
    this.metadataCollector = new MetadataCollector();
    this.toolCallExtractor = new ToolCallExtractor();
  }

  attach(runtime: {
    on: (event: string, handler: (...args: any[]) => void) => () => void;
  }): void {
    const unsubscribeFns: Array<() => void> = [];

    unsubscribeFns.push(
      runtime.on("agent_start", (event: AgentStartEvent) => {
        this.metadataCollector.captureAgentStart(event);
        this.trajectoryBuilder.startSession(event);
      }),
    );

    unsubscribeFns.push(
      runtime.on("agent_end", (event: AgentEndEvent) => {
        this.metadataCollector.captureAgentEnd(event);
        this.trajectoryBuilder.endSession(event);
      }),
    );

    unsubscribeFns.push(
      runtime.on("turn_start", (event: TurnStartEvent) => {
        this.trajectoryBuilder.beginTurn(event);
      }),
    );

    unsubscribeFns.push(
      runtime.on("turn_end", (event: TurnEndEvent) => {
        this.trajectoryBuilder.endTurn(event);
      }),
    );

    unsubscribeFns.push(
      runtime.on("message_start", (event: MessageStartEvent) => {
        this.trajectoryBuilder.beginMessage(event);
      }),
    );

    unsubscribeFns.push(
      runtime.on("message_end", (event: MessageEndEvent) => {
        this.trajectoryBuilder.endMessage(event);
      }),
    );

    unsubscribeFns.push(
      runtime.on("tool_execution_start", (event: ToolExecutionStartEvent) => {
        const toolCall = this.toolCallExtractor.extractStart(event);
        this.trajectoryBuilder.recordToolCallStart(toolCall);
        this.metadataCollector.registerToolUsage(event.toolName);
      }),
    );

    unsubscribeFns.push(
      runtime.on("tool_execution_update", (event: ToolExecutionUpdateEvent) => {
        if (this.config.captureIntermediateSteps) {
          this.trajectoryBuilder.updateToolCall(event);
        }
      }),
    );

    unsubscribeFns.push(
      runtime.on("tool_execution_end", (event: ToolExecutionEndEvent) => {
        const toolCall = this.toolCallExtractor.extractEnd(event);
        this.trajectoryBuilder.recordToolCallEnd(toolCall);
      }),
    );

    this.trajectoryBuilder.setUnsubscribeFns(unsubscribeFns);
  }

  detach(): void {
    this.trajectoryBuilder.cleanup();
  }

  async buildTrajectory(): Promise<Trajectory> {
    const trajectory = this.trajectoryBuilder.build();
    const metadata = this.metadataCollector.buildMetadata();
    return {
      ...trajectory,
      metadata: {
        ...trajectory.metadata,
        ...metadata,
      },
    };
  }
}
