import { Command } from "commander";
import { DatasetManager } from "@opendistil/datasets";

export function registerReplayCommand(program: Command): void {
  program
    .command("replay")
    .description("Replay a recorded trajectory")
    .argument("<dataset>", "Dataset name")
    .argument("<trajectory-id>", "Trajectory ID or index")
    .action(async (datasetName, trajectoryId) => {
      try {
        const manager = new DatasetManager();
        const dataset = manager.load(datasetName);

        if (!dataset) {
          console.error(`Dataset "${datasetName}" not found`);
          process.exit(1);
        }

        const index = parseInt(trajectoryId, 10);
        const record = isNaN(index)
          ? dataset.records.find((r) => r.trajectory.metadata.taskId === trajectoryId)
          : dataset.records[index];

        if (!record) {
          console.error(`Trajectory "${trajectoryId}" not found`);
          process.exit(1);
        }

        const traj = record.trajectory;
        console.log(`\nReplaying trajectory for task: ${traj.metadata.taskDescription}`);
        console.log(`Model: ${traj.metadata.modelId}`);
        console.log(`Status: ${traj.metadata.finalStatus}`);
        console.log(`${"-".repeat(60)}\n`);

        for (const turn of traj.turns) {
          if (turn.userMessage) {
            console.log(`\nUser: ${turn.userMessage.content}`);
          }

          if (turn.assistantMessage) {
            console.log(`\nAssistant: ${turn.assistantMessage.content}`);
          }

          for (const tc of turn.toolResults) {
            console.log(`\n  [Tool] ${tc.toolName}`);
            console.log(`    Args: ${JSON.stringify(tc.arguments)}`);
            console.log(`    Result: ${JSON.stringify(tc.result)}`);
            console.log(`    Duration: ${tc.durationMs}ms`);
            console.log(`    Status: ${tc.status}`);
          }

          console.log(`${"-".repeat(40)}`);
        }
      } catch (err) {
        console.error("Replay failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
