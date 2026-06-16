import { IExporter, ExportContext, ExportResult, DatasetRecord } from "@opendistil/core";
import { createHash } from "crypto";
import { writeFileSync } from "fs";

export class GenericJSONLExporter implements IExporter {
  readonly name = "jsonl";
  readonly format = "jsonl";
  readonly mimeType = "application/jsonl";

  exportRecord(record: DatasetRecord, _context: ExportContext): unknown {
    const trajectory = record.trajectory;
    const steps = trajectory.turns.map((turn) => ({
      step: turn.index,
      type: "tool_call" as const,
      tool: turn.toolResults[0]?.toolName ?? "",
      input: turn.toolResults[0]?.arguments ?? {},
      output: turn.toolResults[0]?.result ?? null,
      duration_ms: turn.toolResults[0]?.durationMs ?? 0,
    }));

    return {
      task: trajectory.metadata.taskDescription,
      trajectory: steps,
      final_answer: trajectory.messages[trajectory.messages.length - 1]?.content ?? "",
      metadata: {
        model: trajectory.metadata.modelId,
        total_duration_ms: trajectory.metadata.totalDurationMs,
        tools_used: trajectory.metadata.toolsUsed,
        status: trajectory.metadata.finalStatus,
      },
    };
  }

  async exportBatch(records: DatasetRecord[], context: ExportContext): Promise<ExportResult> {
    const lines = records.map((r) => JSON.stringify(this.exportRecord(r, context)));
    const content = lines.join("\n");
    const hash = createHash("sha256").update(content).digest("hex");

    const filePath = (context.options.outputPath as string) ?? "./generic_dataset.jsonl";
    writeFileSync(filePath, content, "utf-8");

    return {
      format: "jsonl",
      path: filePath,
      recordCount: records.length,
      sizeBytes: Buffer.byteLength(content, "utf-8"),
      hash,
      timestamp: new Date().toISOString(),
    };
  }

  validate(result: ExportResult): boolean {
    return result.format === "jsonl" && result.recordCount > 0 && result.sizeBytes > 0;
  }
}
