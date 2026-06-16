import { DatasetRecord } from "@opendistil/core";
import { createHash } from "crypto";

export class Deduplicator {
  deduplicate(records: DatasetRecord[]): DatasetRecord[] {
    const seen = new Set<string>();
    const unique: DatasetRecord[] = [];

    for (const record of records) {
      const hash = this.computeHash(record);
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(record);
      }
    }

    return unique;
  }

  private computeHash(record: DatasetRecord): string {
    const content = JSON.stringify({
      taskId: record.trajectory.metadata.taskId,
      messages: record.trajectory.messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      toolCalls: record.trajectory.turns.flatMap((t) =>
        t.toolResults.map((tc) => ({
          toolName: tc.toolName,
          arguments: tc.arguments,
          result: tc.result,
        })),
      ),
    });

    return createHash("sha256").update(content).digest("hex");
  }

  findDuplicates(records: DatasetRecord[]): Map<string, DatasetRecord[]> {
    const groups = new Map<string, DatasetRecord[]>();

    for (const record of records) {
      const hash = this.computeHash(record);
      if (!groups.has(hash)) {
        groups.set(hash, []);
      }
      groups.get(hash)!.push(record);
    }

    for (const [hash, group] of groups) {
      if (group.length <= 1) {
        groups.delete(hash);
      }
    }

    return groups;
  }
}
