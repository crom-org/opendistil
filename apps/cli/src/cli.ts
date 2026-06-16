import { Command } from "commander";
import { registerGenerateCommand } from "./commands/generate";
import { registerExportCommand } from "./commands/export";
import { registerValidateCommand } from "./commands/validate";
import { registerInspectCommand } from "./commands/inspect";
import { registerReplayCommand } from "./commands/replay";
import { registerListCommand } from "./commands/list";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../package.json");

export function createCLI(): Command {
  const program = new Command();

  program
    .name("opendistil")
    .description("Open-source platform for generating agent trajectory datasets")
    .version(packageJson.version);

  registerGenerateCommand(program);
  registerExportCommand(program);
  registerValidateCommand(program);
  registerInspectCommand(program);
  registerReplayCommand(program);
  registerListCommand(program);

  program
    .command("config")
    .description("Manage configuration (set, get, list)")
    .argument("<action>", "Action: set, get, list")
    .argument("[key]", "Config key")
    .argument("[value]", "Config value")
    .action((action: string, key?: string, value?: string) => {
      switch (action) {
        case "list":
          console.log("Configuration:");
          console.log("  defaultProvider: podman");
          console.log("  storageDir: ~/.opendistil/datasets");
          break;
        case "get":
          if (key === "defaultProvider") console.log("podman");
          else console.log(`Unknown key: ${key}`);
          break;
        case "set":
          console.log(`Set ${key}=${value} (not yet persisted)`);
          break;
        default:
          console.error(`Unknown action: ${action}`);
      }
    });

  program
    .command("version")
    .description("Show version")
    .action(() => {
      console.log(packageJson.version);
    });

  return program;
}
