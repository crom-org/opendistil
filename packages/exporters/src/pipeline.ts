import { IExporter, Dataset, ExportContext, ExportResult } from "@opendistil/core";
import { OpenAIExporter } from "./exporters/openaiExporter";
import { AnthropicExporter } from "./exporters/anthropicExporter";
import { ShareGPTExporter } from "./exporters/sharegptExporter";
import { GenericJSONLExporter } from "./exporters/genericJsonlExporter";

export class ExporterPipeline {
  private exporters: Map<string, IExporter> = new Map();

  register(exporter: IExporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  getExporter(format: string): IExporter | null {
    return this.exporters.get(format) ?? null;
  }

  listFormats(): string[] {
    return Array.from(this.exporters.keys());
  }

  async export(
    dataset: Dataset,
    formats: string[],
    options: Record<string, unknown> = {},
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    const context: ExportContext = { dataset, options };

    for (const format of formats) {
      const exporter = this.exporters.get(format);
      if (!exporter) {
        throw new Error(`Exporter for format "${format}" not found`);
      }
      const result = await exporter.exportBatch(dataset.records, context);
      results.push(result);
    }

    return results;
  }

  static createDefault(): ExporterPipeline {
    const pipeline = new ExporterPipeline();
    pipeline.register(new OpenAIExporter());
    pipeline.register(new AnthropicExporter());
    pipeline.register(new ShareGPTExporter());
    pipeline.register(new GenericJSONLExporter());

    return pipeline;
  }
}
