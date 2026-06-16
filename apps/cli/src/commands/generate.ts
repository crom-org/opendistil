import { Command } from "commander";
import { OpenDistil, GenerateConfig } from "opendistil";

export function registerGenerateCommand(program: Command): void {
  program
    .command("generate")
    .description("Generate a dataset by executing tasks with an agent")
    .requiredOption("--tasks <file>", "Path to tasks JSON file")
    .option("--model <id>", "Model ID to use", "claude-sonnet-4-20250514")
    .option("--env <type>", "Environment type (podman, docker, local)", "podman")
    .option("--output <dir>", "Output directory", "./datasets")
    .option("--max-concurrent <n>", "Maximum concurrent executions", "1")
    .option("--timeout <ms>", "Timeout per task in milliseconds", "300000")
    .option("--format <formats>", "Export formats (comma-separated)", "jsonl")
    .action(async (options) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tasks = require(options.tasks);
        const taskArray = Array.isArray(tasks) ? tasks : tasks.tasks ?? [];

        const config: GenerateConfig = {
          tasks: taskArray,
          modelId: options.model,
          modelProvider: options.model.split("-")[0] ?? "unknown",
          environmentType: options.env,
          outputDir: options.output,
          maxConcurrent: parseInt(options.maxConcurrent, 10),
          timeoutMs: parseInt(options.timeout, 10),
          exportFormats: options.format.split(",").map((f: string) => f.trim()),
        };

        const client = new OpenDistil();
        console.log(`Generating dataset with ${taskArray.length} tasks...`);
        console.log(`Model: ${config.modelId}`);
        console.log(`Environment: ${config.environmentType}`);

        const result = await client.generate(config);

        console.log(`\nDataset generated successfully!`);
        console.log(`Dataset ID: ${result.dataset.id}`);
        console.log(`Records: ${result.dataset.records.length}`);
        console.log(`Exports:`);
        for (const exp of result.exportResults) {
          console.log(`  [${exp.format}] ${exp.path} (${exp.recordCount} records, ${(exp.sizeBytes / 1024).toFixed(1)} KB)`);
        }
      } catch (err) {
        console.error("Generation failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
