import {
  TaskDefinition,
  EnvironmentSpec,
  Dataset,
  ExportResult,
} from "@opendistil/core";
import { Runner, ExecutionResult } from "@opendistil/runner";
import { ProviderFactory } from "@opendistil/environments";
import { ExporterPipeline } from "@opendistil/exporters";
import { DatasetManager } from "@opendistil/datasets";
import { TaskGeneratorRegistry } from "@opendistil/task-generator";
import { MetricsCollector } from "@opendistil/telemetry";

export interface GenerateConfig {
  tasks: TaskDefinition[];
  modelId: string;
  modelProvider: string;
  environmentType: "podman" | "docker" | "local";
  environmentImage?: string;
  outputDir: string;
  maxConcurrent?: number;
  timeoutMs?: number;
  exportFormats?: string[];
}

export class Orchestrator {
  private providerFactory: ProviderFactory;
  private exporterPipeline: ExporterPipeline;
  private datasetManager: DatasetManager;
  private runner: Runner;

  constructor(
    providerFactory: ProviderFactory,
    exporterPipeline: ExporterPipeline,
    datasetManager: DatasetManager,
    _taskRegistry: TaskGeneratorRegistry,
    _metrics: MetricsCollector,
    runner: Runner,
  ) {
    this.providerFactory = providerFactory;
    this.exporterPipeline = exporterPipeline;
    this.datasetManager = datasetManager;
    this.runner = runner;
  }

  async generate(config: GenerateConfig): Promise<{
    dataset: Dataset;
    results: ExecutionResult[];
    exportResults: ExportResult[];
  }> {
    const spec: EnvironmentSpec = {
      image: config.environmentImage ?? "ubuntu:22.04",
      networkAccess: true,
      timeoutMs: config.timeoutMs ?? 300_000,
      memoryLimit: "4g",
      cpuLimit: "2",
    };

    const provider = this.providerFactory.getProvider(config.environmentType);
    const environment = await provider.createEnvironment(spec);

    const dataset = this.datasetManager.create(
      `dataset-${Date.now()}`,
      `Generated with model ${config.modelId}`,
    );

    try {
      const results = await this.runner.executeBatch(
        config.tasks,
        provider,
        environment.id,
      );

      for (const result of results) {
        if (result.trajectory) {
          result.trajectory.metadata.modelId = config.modelId;
          result.trajectory.metadata.modelProvider = config.modelProvider;
          result.trajectory.metadata.environmentId = environment.id;
          result.trajectory.metadata.environmentType = config.environmentType;
          this.datasetManager.addTrajectory(dataset.id, result.trajectory);
        }
      }

      const exportFormats = config.exportFormats ?? ["jsonl"];
      const exportResults = await this.exporterPipeline.export(
        dataset,
        exportFormats,
        { outputPath: config.outputDir },
      );

      this.datasetManager.save(dataset);

      return { dataset, results, exportResults };
    } finally {
      await provider.destroyEnvironment(environment.id);
    }
  }

  static createDefault(config?: {
    storageDir?: string;
    defaultProvider?: string;
  }): Orchestrator {
    const providerFactory = ProviderFactory.createDefault({
      defaultProvider: config?.defaultProvider,
    });
    const exporterPipeline = ExporterPipeline.createDefault();
    const datasetManager = new DatasetManager(config?.storageDir);
    const taskRegistry = new TaskGeneratorRegistry();
    const metrics = new MetricsCollector();
    const runner = new Runner();

    return new Orchestrator(
      providerFactory,
      exporterPipeline,
      datasetManager,
      taskRegistry,
      metrics,
      runner,
    );
  }
}
