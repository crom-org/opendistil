import { IExporter, ExportContext, ExportResult, DatasetRecord } from "@opendistil/core";
import { createHash } from "crypto";
import { writeFileSync } from "fs";

export class AnthropicExporter implements IExporter {
  readonly name = "anthropic";
  readonly format = "anthropic";
  readonly mimeType = "application/jsonl";

  exportRecord(record: DatasetRecord, _context: ExportContext): unknown {
    const trajectory = record.trajectory;
    const messages: Array<Record<string, unknown>> = [];

    for (const msg of trajectory.messages) {
      if (msg.role === "assistant" && msg.toolCalls.length > 0) {
        const content: unknown[] = [];
        if (msg.content) {
          content.push({ type: "text", text: msg.content });
        }
        for (const tc of msg.toolCalls) {
          content.push({
            type: "tool_use",
            id: tc.id,
            name: tc.toolName,
            input: tc.arguments,
          });
        }
        messages.push({ role: "assistant", content });
      } else if (msg.role === "tool_result") {
        messages.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: msg.toolCalls[0]?.id ?? "",
              content: typeof msg.content === "string" ? msg.content : JSON.stringify(msg.content),
            },
          ],
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

    const filePath = (context.options.outputPath as string) ?? "./anthropic_dataset.jsonl";
    writeFileSync(filePath, content, "utf-8");

    return {
      format: "anthropic",
      path: filePath,
      recordCount: records.length,
      sizeBytes: Buffer.byteLength(content, "utf-8"),
      hash,
      timestamp: new Date().toISOString(),
    };
  }

  validate(result: ExportResult): boolean {
    return result.format === "anthropic" && result.recordCount > 0 && result.sizeBytes > 0;
  }
}
