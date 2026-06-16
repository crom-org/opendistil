import { Command } from "commander";
import { OpenDistil } from "opendistil";
import { DatasetManager } from "@opendistil/datasets";

export function registerExportCommand(program: Command): void {
  program
    .command("export")
    .description("Export a dataset to specific formats")
    .argument("<dataset>", "Dataset name or path")
    .option("--format <formats>", "Export formats (comma-separated)", "all")
    .option("--output <dir>", "Output directory")
    .action(async (datasetName, options) => {
      try {
        const manager = new DatasetManager();
        const dataset = manager.load(datasetName);

        if (!dataset) {
          console.error(`Dataset "${datasetName}" not found`);
          process.exit(1);
        }

        const formats = options.format === "all"
          ? ["openai", "anthropic", "sharegpt", "jsonl"]
          : options.format.split(",").map((f: string) => f.trim());

        const outputDir = options.output ?? `./${datasetName}/exported`;

        const client = new OpenDistil();
        const results = await client.exportDataset(dataset, formats, outputDir);

        console.log(`Exported ${dataset.records.length} records:`);
        for (const result of results) {
          console.log(`  [${result.format}] ${result.path} (${(result.sizeBytes / 1024).toFixed(1)} KB)`);
        }
      } catch (err) {
        console.error("Export failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
