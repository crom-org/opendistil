import type { AgentSession, AgentSessionEvent } from "@earendil-works/pi-coding-agent";
import {
  Trajectory,
} from "@opendistil/core";
import { TrajectoryBuilder } from "./trajectoryBuilder";
import { MetadataCollector } from "./metadataCollector";

export class Recorder {
  private trajectoryBuilder: TrajectoryBuilder;
  private metadataCollector: MetadataCollector;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    this.trajectoryBuilder = new TrajectoryBuilder();
    this.metadataCollector = new MetadataCollector();
  }

  attach(session: AgentSession): () => void {
    this.unsubscribe = session.subscribe((event: AgentSessionEvent) => {
      switch (event.type) {
        case "agent_start":
          this.trajectoryBuilder.startSession();
          break;

        case "agent_end":
          this.trajectoryBuilder.endSession(event.messages as unknown as any[]);
          break;

        case "turn_start":
          this.trajectoryBuilder.beginTurn();
          break;

        case "turn_end":
          this.trajectoryBuilder.endTurn(
            event.message as unknown as any,
            event.toolResults as unknown as any[],
          );
          break;

        case "message_start":
          this.trajectoryBuilder.beginMessage(event.message as unknown as any);
          break;

        case "message_update":
          this.trajectoryBuilder.updateMessage(
            event.message as unknown as any,
            event.assistantMessageEvent as unknown as any,
          );
          break;

        case "message_end":
          this.trajectoryBuilder.endMessage(event.message as unknown as any);
          break;

        case "tool_execution_start":
          this.trajectoryBuilder.recordToolCallStart(
            event.toolCallId,
            event.toolName,
            event.args,
          );
          this.metadataCollector.registerToolUsage(event.toolName);
          break;

        case "tool_execution_update":
          this.trajectoryBuilder.updateToolCall(
            event.toolCallId,
            event.partialResult,
          );
          break;

        case "tool_execution_end":
          this.trajectoryBuilder.recordToolCallEnd(
            event.toolCallId,
            event.toolName,
            event.result,
            event.isError,
          );
          break;
      }
    });

    return () => this.detach();
  }

  detach(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
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
