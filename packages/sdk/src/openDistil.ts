import { Dataset, ExportResult } from "@opendistil/core";
import { ExporterPipeline } from "@opendistil/exporters";
import { Orchestrator, GenerateConfig } from "./orchestrator";

export interface OpenDistilConfig {
  storageDir?: string;
  defaultProvider?: string;
}

export class OpenDistil {
  private orchestrator: Orchestrator;

  constructor(config?: OpenDistilConfig) {
    this.orchestrator = Orchestrator.createDefault(config);
  }

  async generate(config: GenerateConfig): Promise<{
    dataset: Dataset;
    exportResults: ExportResult[];
  }> {
    const result = await this.orchestrator.generate(config);
    return {
      dataset: result.dataset,
      exportResults: result.exportResults,
    };
  }

  async exportDataset(
    dataset: Dataset,
    formats: string[],
    outputPath: string,
  ): Promise<ExportResult[]> {
    const pipeline = ExporterPipeline.createDefault();
    return pipeline.export(dataset, formats, { outputPath });
  }

  getOrchestrator(): Orchestrator {
    return this.orchestrator;
  }
}
