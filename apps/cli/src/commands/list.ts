import { Command } from "commander";
import { DatasetManager } from "@opendistil/datasets";
import { ProviderFactory } from "@opendistil/environments";

export function registerListCommand(program: Command): void {
  program
    .command("list")
    .description("List resources (datasets, environments)")
    .argument("[type]", "Resource type (datasets, environments)", "datasets")
    .option("--filter <key=value>", "Filter results")
    .action(async (type, _options) => {
      try {
        if (type === "datasets") {
          const manager = new DatasetManager();
          const datasets = manager.list();

          if (datasets.length === 0) {
            console.log("No datasets found");
            return;
          }

          console.log("Available datasets:");
          for (const ds of datasets) {
            console.log(`  ${ds.name} (${ds.id}) - ${ds.records.length} records - ${ds.createdAt}`);
          }
        } else if (type === "environments") {
          const factory = ProviderFactory.createDefault();
          const providers = factory.getAvailableProviders();
          console.log("Available environment providers:");
          for (const p of providers) {
            console.log(`  ${p}`);
          }
        } else {
          console.error(`Unknown resource type: ${type}`);
          process.exit(1);
        }
      } catch (err) {
        console.error("List failed:", (err as Error).message);
        process.exit(1);
      }
    });
}
