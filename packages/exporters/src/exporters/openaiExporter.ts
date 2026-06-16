import { IExporter, ExportContext, ExportResult, DatasetRecord } from "@opendistil/core";
import { createHash } from "crypto";
import { writeFileSync } from "fs";

export class OpenAIExporter implements IExporter {
  readonly name = "openai";
  readonly format = "openai";
  readonly mimeType = "application/jsonl";

  exportRecord(record: DatasetRecord, _context: ExportContext): unknown {
    const trajectory = record.trajectory;
    const messages: Array<Record<string, unknown>> = [];

    for (const msg of trajectory.messages) {
      if (msg.role === "assistant" && msg.toolCalls.length > 0) {
        messages.push({
          role: "assistant",
          content: msg.content,
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: "function",
            function: {
              name: tc.toolName,
              arguments: JSON.stringify(tc.arguments),
            },
          })),
        });
      } else if (msg.role === "tool_result") {
        messages.push({
          role: "tool",
          tool_call_id: msg.toolCalls[0]?.id ?? "",
          content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
        });
      } else {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    return { messages };
  }

  async exportBatch(records: DatasetRecord[], context: ExportContext): Promise<ExportResult> {
    const lines = records.map((r) => JSON.stringify(this.exportRecord(r, context)));
    const content = lines.join("\n");
    const hash = createHash("sha256").update(content).digest("hex");

    const filePath = (context.options.outputPath as string) ?? "./openai_dataset.jsonl";
    writeFileSync(filePath, content, "utf-8");

    return {
      format: "openai",
      path: filePath,
      recordCount: records.length,
      sizeBytes: Buffer.byteLength(content, "utf-8"),
      hash,
      timestamp: new Date().toISOString(),
    };
  }

  validate(result: ExportResult): boolean {
    return result.format === "openai" && result.recordCount > 0 && result.sizeBytes > 0;
  }
}
