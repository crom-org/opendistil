import { DatasetRecord, Trajectory } from "@opendistil/core";

export interface ScoreWeights {
  toolCallSuccess: number;
  completionStatus: number;
  tokenEfficiency: number;
  turnEfficiency: number;
  toolDiversity: number;
}

export class Scorer {
  private weights: ScoreWeights;

  constructor(weights?: Partial<ScoreWeights>) {
    this.weights = {
      toolCallSuccess: 0.3,
      completionStatus: 0.3,
      tokenEfficiency: 0.15,
      turnEfficiency: 0.15,
      toolDiversity: 0.1,
      ...weights,
    };
  }

  score(record: DatasetRecord): number {
    const trajectory = record.trajectory;
    let score = 0;

    score += this.scoreToolCallSuccess(trajectory) * this.weights.toolCallSuccess;
    score += this.scoreCompletionStatus(trajectory) * this.weights.completionStatus;
    score += this.scoreTokenEfficiency(trajectory) * this.weights.tokenEfficiency;
    score += this.scoreTurnEfficiency(trajectory) * this.weights.turnEfficiency;
    score += this.scoreToolDiversity(trajectory) * this.weights.toolDiversity;

    return Math.round(score * 100) / 100;
  }

  scoreBatch(records: DatasetRecord[]): Array<{ record: DatasetRecord; score: number }> {
    return records.map((record) => ({
      record,
      score: this.score(record),
    }));
  }

  private scoreToolCallSuccess(trajectory: Trajectory): number {
    let total = 0;
    let success = 0;

    for (const turn of trajectory.turns) {
      for (const tc of turn.toolResults) {
        total++;
        if (tc.status === "success") success++;
      }
    }

    return total > 0 ? success / total : 0;
  }

  private scoreCompletionStatus(trajectory: Trajectory): number {
    return trajectory.metadata?.finalStatus === "success" ? 1 : 0;
  }

  private scoreTokenEfficiency(trajectory: Trajectory): number {
    const tokens = trajectory.metadata?.totalTokens ?? 0;
    if (tokens === 0) return 0.5;

    const efficiency = 1 - Math.min(tokens / 10000, 1);
    return Math.max(efficiency, 0);
  }

  private scoreTurnEfficiency(trajectory: Trajectory): number {
    const turns = trajectory.turns.length;
    if (turns === 0) return 0;

    const efficiency = 1 - Math.min(turns / 15, 1);
    return Math.max(efficiency, 0);
  }

  private scoreToolDiversity(trajectory: Trajectory): number {
    const toolsUsed = new Set<string>();
    for (const turn of trajectory.turns) {
      for (const tc of turn.toolResults) {
        toolsUsed.add(tc.toolName);
      }
    }

    const totalAvailable = trajectory.metadata?.toolsAvailable?.length ?? 1;
    return Math.min(toolsUsed.size / totalAvailable, 1);
  }
}
