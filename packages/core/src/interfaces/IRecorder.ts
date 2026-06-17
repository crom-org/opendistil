import { Trajectory } from "../types/trajectory";

export interface IRecorder {
  attach(session: unknown): () => void;
  detach(): void;
  buildTrajectory(): Promise<Trajectory>;
}

export interface RecorderConfig {
  captureRawEvents: boolean;
  captureIntermediateSteps: boolean;
  maxToolCallDurationMs: number;
}
