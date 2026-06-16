import { IExporter, ExportContext, ExportResult, DatasetRecord } from "@opendistil/core";
import { createHash } from "crypto";
import { writeFileSync } from "fs";

export class ShareGPTExporter implements IExporter {
  readonly name = "sharegpt";
  readonly format = "sharegpt";
  readonly mimeType = "application/jsonl";

  exportRecord(record: DatasetRecord, _context: ExportContext): unknown {
    const trajectory = record.trajectory;
    const conversations: Array<{ from: string; value: string }> = [];

    for (const msg of trajectory.messages) {
      if (msg.role === "user") {
        conversations.push({ from: "human", value: msg.content ?? "" });
      } else if (msg.role === "assistant") {
        conversations.push({ from: "gpt", value: msg.content ?? "" });
      }
    }

    return {
      id: trajectory.metadata.taskId,
      conversations,
    };
  }

  async exportBatch(records: DatasetRecord[], context: ExportContext): Promise<ExportResult> {
    const lines = records.map((r) => JSON.stringify(this.exportRecord(r, context)));
    const content = lines.join("\n");
    const hash = createHash("sha256").update(content).digest("hex");

    const filePath = (context.options.outputPath as string) ?? "./sharegpt_dataset.jsonl";
    writeFileSync(filePath, content, "utf-8");

    return {
      format: "sharegpt",
      path: filePath,
      recordCount: records.length,
      sizeBytes: Buffer.byteLength(content, "utf-8"),
      hash,
      timestamp: new Date().toISOString(),
    };
  }

  validate(result: ExportResult): boolean {
    return result.format === "sharegpt" && result.recordCount > 0 && result.sizeBytes > 0;
  }
}
