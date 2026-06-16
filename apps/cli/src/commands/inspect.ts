import { Command } from "commander";
import { DatasetManager } from "@opendistil/datasets";

export function registerInspectCommand(program: Command): void {
  program
    .command("inspect")
    .description("Inspect a dataset or trajectory")
    .argument("<dataset>", "Dataset name or path")
    .option("--trajectory <id>", "Specific trajectory ID to inspect")
    .option("--json", "Output as JSON", false)
    .option("--stats", "Show statistics only", false)
    .action(async (datasetName, options) => {
      try {
        const manager = new DatasetManager();
        const dataset = manager.load(datasetName);

        if (!dataset) {
          console.error(`Dataset "${datasetName}" not found`);
          process.exit(1);
        }

        if (options.stats) {
          const totalTurns = dataset.records.reduce(
            (sum, r) => sum + r.trajectory.turns.length, 0,
          );
          const totalToolCalls = dataset.records.reduce(
            (sum, r) => sum + r.trajectory.turns.reduce(
              (s, t) => s + t.toolResults.length, 0,
            ), 0,
          );

          console.log(`Dataset: ${dataset.name} (${dataset.id})`);
          console.log(`Version: ${dataset.version}`);
          console.log(`Created: ${dataset.createdAt}`);
          console.log(`Records: ${dataset.records.length}`);
          console.log(`Total Turns: ${totalTurns}`);
          console.log(`Total Tool Calls: ${totalToolCalls}`);
          console.log(`Avg Turns/Record: ${(totalTurns / dataset.records.length).toFixed(1)}`);
          console.log(`Avg Tool Calls/Record: ${(totalToolCalls / dataset.records.length).toFixed(1)}`);
          return;
        }

        if (options.json) {
          console.log(JSON.stringify(dataset, null, 2));
          return;
        }

        console.log(`Dataset: ${dataset.name} (${dataset.id})`);
        console.log(`Description: ${dataset.description}`);
        console.log(`Version: ${dataset.version}`);
        console.log(`Records: ${dataset.records.length}`);

        for (let i = 0; i < Math.min(dataset.records.length, 5); i++) {
          const traj = dataset.records[i].trajectory;
          console.log(`\n  Trajectory ${i + 1}:`);
          console.log(`    Task: ${traj.metadata.taskDescription || "(not set)"}`);
          console.log(`    Model: ${traj.metadata.modelId}`);
          console.log(`    Status: ${traj.metadata.finalStatus}`);
          console.log(`    Turns: ${traj.turns.length}`);
          console.log(`    Duration: ${(traj.metadata.totalDurationMs / 1000).toFixed(1)}s`);
        }

        if (dataset.records.length > 5) {
          console.log(`\n  ... and ${dataset.records.length - 5} more records`);
        }
      } catch (err) {
        console.error("Inspection failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
