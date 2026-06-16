import { Trajectory } from "../types/trajectory";
import { AgentEvent } from "../types/events";

export interface IRecorder {
  attach(runtime: unknown): void;
  detach(): void;
  buildTrajectory(): Promise<Trajectory>;
  onEvent(event: AgentEvent): void;
}

export interface RecorderConfig {
  captureRawEvents: boolean;
  captureIntermediateSteps: boolean;
  maxToolCallDurationMs: number;
}
