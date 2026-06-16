import { Dataset, DatasetValidator as CoreValidator, ValidationResult } from "@opendistil/core";

export interface DatasetQualityReport {
  datasetId: string;
  datasetName: string;
  validation: ValidationResult;
  quality: {
    completionRate: number;
    toolCallSuccessRate: number;
    averageTurnsPerRecord: number;
    averageToolCallsPerRecord: number;
    averageDurationMs: number;
    diversityScore: number;
  };
}

export class DatasetQualityValidator {
  private coreValidator = new CoreValidator();

  validate(dataset: Dataset): DatasetQualityReport {
    const validation = this.coreValidator.validate(dataset);

    const totalRecords = dataset.records.length;
    if (totalRecords === 0) {
      return {
        datasetId: dataset.id,
        datasetName: dataset.name,
        validation,
        quality: {
          completionRate: 0,
          toolCallSuccessRate: 0,
          averageTurnsPerRecord: 0,
          averageToolCallsPerRecord: 0,
          averageDurationMs: 0,
          diversityScore: 0,
        },
      };
    }

    const trajectories = dataset.records.map((r) => r.trajectory);
    const successfulTrajectories = trajectories.filter(
      (t) => t.metadata?.finalStatus === "success",
    );
    const completionRate = successfulTrajectories.length / totalRecords;

    let totalToolCalls = 0;
    let successfulToolCalls = 0;
    let totalTurns = 0;
    let totalDuration = 0;
    const allTools = new Set<string>();

    for (const t of trajectories) {
      totalTurns += t.turns.length;
      totalDuration += t.metadata?.totalDurationMs ?? 0;
      for (const turn of t.turns) {
        for (const tc of turn.toolResults) {
          totalToolCalls++;
          if (tc.status === "success") successfulToolCalls++;
          allTools.add(tc.toolName);
        }
      }
    }

    const toolCallSuccessRate = totalToolCalls > 0 ? successfulToolCalls / totalToolCalls : 0;
    const averageTurnsPerRecord = totalTurns / totalRecords;
    const averageToolCallsPerRecord = totalToolCalls / totalRecords;
    const averageDurationMs = totalDuration / totalRecords;

    const totalPossibleTools = trajectories.reduce(
      (sum, t) => sum + (t.metadata?.toolsAvailable?.length ?? 0),
      0,
    );
    const diversityScore =
      totalPossibleTools > 0 ? allTools.size / (totalPossibleTools / totalRecords) : 0;

    return {
      datasetId: dataset.id,
      datasetName: dataset.name,
      validation,
      quality: {
        completionRate,
        toolCallSuccessRate,
        averageTurnsPerRecord,
        averageToolCallsPerRecord,
        averageDurationMs,
        diversityScore: Math.min(diversityScore, 1),
      },
    };
  }
}
