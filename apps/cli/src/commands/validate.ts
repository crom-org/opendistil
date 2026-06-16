import { Command } from "commander";
import { DatasetManager, DatasetQualityValidator } from "@opendistil/datasets";

export function registerValidateCommand(program: Command): void {
  program
    .command("validate")
    .description("Validate a dataset's integrity and quality")
    .argument("<dataset>", "Dataset name or path")
    .option("--strict", "Fail on warnings as well", false)
    .option("--report <file>", "Output report to file")
    .action(async (datasetName, options) => {
      try {
        const manager = new DatasetManager();
        const dataset = manager.load(datasetName);

        if (!dataset) {
          console.error(`Dataset "${datasetName}" not found`);
          process.exit(1);
        }

        const validator = new DatasetQualityValidator();
        const report = validator.validate(dataset);

        console.log(`\nDataset: ${report.datasetName} (${report.datasetId})`);
        console.log(`Valid: ${report.validation.valid}`);

        if (report.validation.errors.length > 0) {
          console.log(`\nErrors (${report.validation.errors.length}):`);
          for (const err of report.validation.errors) {
            console.log(`  [${err.severity}] ${err.field}: ${err.message}`);
          }
        }

        if (report.validation.warnings.length > 0) {
          console.log(`\nWarnings (${report.validation.warnings.length}):`);
          for (const warn of report.validation.warnings) {
            console.log(`  ${warn.field}: ${warn.message}`);
          }
        }

        console.log(`\nQuality Metrics:`);
        console.log(`  Completion Rate: ${(report.quality.completionRate * 100).toFixed(1)}%`);
        console.log(`  Tool Call Success Rate: ${(report.quality.toolCallSuccessRate * 100).toFixed(1)}%`);
        console.log(`  Avg Turns/Record: ${report.quality.averageTurnsPerRecord.toFixed(1)}`);
        console.log(`  Avg Tool Calls/Record: ${report.quality.averageToolCallsPerRecord.toFixed(1)}`);
        console.log(`  Avg Duration: ${(report.quality.averageDurationMs / 1000).toFixed(1)}s`);
        console.log(`  Diversity Score: ${(report.quality.diversityScore * 100).toFixed(1)}%`);

        if (options.report) {
          const { writeFileSync } = await import("fs");
          writeFileSync(options.report, JSON.stringify(report, null, 2), "utf-8");
          console.log(`\nReport saved to ${options.report}`);
        }

        if (options.strict && !report.validation.valid) {
          process.exit(1);
        }
      } catch (err) {
        console.error("Validation failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
