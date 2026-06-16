import { DatasetRecord } from "@opendistil/core";

export interface FilterCriteria {
  minTurns?: number;
  maxTurns?: number;
  allowedStatuses?: string[];
  requiredTools?: string[];
  minDurationMs?: number;
  maxDurationMs?: number;
}

export class Filter {
  apply(records: DatasetRecord[], criteria: FilterCriteria): DatasetRecord[] {
    return records.filter((record) => this.matches(record, criteria));
  }

  private matches(record: DatasetRecord, criteria: FilterCriteria): boolean {
    const trajectory = record.trajectory;

    if (criteria.minTurns !== undefined && trajectory.turns.length < criteria.minTurns) {
      return false;
    }

    if (criteria.maxTurns !== undefined && trajectory.turns.length > criteria.maxTurns) {
      return false;
    }

    if (criteria.allowedStatuses && criteria.allowedStatuses.length > 0) {
      if (!criteria.allowedStatuses.includes(trajectory.metadata?.finalStatus ?? "")) {
        return false;
      }
    }

    if (criteria.requiredTools && criteria.requiredTools.length > 0) {
      const usedTools = new Set<string>();
      for (const turn of trajectory.turns) {
        for (const tc of turn.toolResults) {
          usedTools.add(tc.toolName);
        }
      }
      for (const tool of criteria.requiredTools) {
        if (!usedTools.has(tool)) return false;
      }
    }

    if (criteria.minDurationMs !== undefined) {
      const duration = trajectory.metadata?.totalDurationMs ?? 0;
      if (duration < criteria.minDurationMs) return false;
    }

    if (criteria.maxDurationMs !== undefined) {
      const duration = trajectory.metadata?.totalDurationMs ?? 0;
      if (duration > criteria.maxDurationMs) return false;
    }

    return true;
  }
}
