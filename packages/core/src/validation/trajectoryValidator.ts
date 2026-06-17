import { Trajectory, ToolCall } from "../types/trajectory.js";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export class TrajectoryValidator {
  validate(trajectory: Trajectory): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateMetadata(trajectory, errors, warnings);
    this.validateTurns(trajectory, errors, warnings);
    this.validateMessages(trajectory, errors, warnings);
    this.validateToolCalls(trajectory, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private validateMetadata(
    trajectory: Trajectory,
    errors: ValidationError[],
    _warnings: ValidationWarning[],
  ): void {
    const m = trajectory.metadata;
    if (!m.taskId) errors.push({ field: "metadata.taskId", message: "taskId is required", severity: "error" });
    if (!m.modelId) errors.push({ field: "metadata.modelId", message: "modelId is required", severity: "error" });
    if (!m.timestamp) errors.push({ field: "metadata.timestamp", message: "timestamp is required", severity: "error" });
    if (m.totalDurationMs < 0) errors.push({ field: "metadata.totalDurationMs", message: "totalDurationMs must be non-negative", severity: "error" });
  }

  private validateTurns(
    trajectory: Trajectory,
    errors: ValidationError[],
    warnings: ValidationWarning[],
  ): void {
    if (!trajectory.turns || trajectory.turns.length === 0) {
      warnings.push({ field: "turns", message: "No turns recorded" });
      return;
    }

    for (let i = 0; i < trajectory.turns.length; i++) {
      const turn = trajectory.turns[i];
      if (turn.index !== i) {
        errors.push({ field: `turns[${i}].index`, message: `Expected index ${i}, got ${turn.index}`, severity: "error" });
      }
      if (new Date(turn.endTime) < new Date(turn.startTime)) {
        errors.push({ field: `turns[${i}].duration`, message: "endTime before startTime", severity: "error" });
      }
    }
  }

  private validateMessages(
    trajectory: Trajectory,
    errors: ValidationError[],
    _warnings: ValidationWarning[],
  ): void {
    for (let i = 0; i < trajectory.messages.length; i++) {
      const msg = trajectory.messages[i];
      if (!msg.id) errors.push({ field: `messages[${i}].id`, message: "message id is required", severity: "error" });
      if (!msg.role) errors.push({ field: `messages[${i}].role`, message: "message role is required", severity: "error" });
    }
  }

  private validateToolCalls(
    trajectory: Trajectory,
    errors: ValidationError[],
    _warnings: ValidationWarning[],
  ): void {
    for (const turn of trajectory.turns) {
      for (const tc of turn.toolResults) {
        this.validateToolCall(tc, errors);
      }
    }
  }

  private validateToolCall(
    tc: ToolCall,
    errors: ValidationError[],
  ): void {
    if (!tc.id) errors.push({ field: "toolCall.id", message: "ToolCall id is required", severity: "error" });
    if (!tc.toolName) errors.push({ field: "toolCall.toolName", message: "ToolCall toolName is required", severity: "error" });
    if (tc.durationMs < 0) errors.push({ field: "toolCall.durationMs", message: "durationMs must be non-negative", severity: "error" });
  }
}
