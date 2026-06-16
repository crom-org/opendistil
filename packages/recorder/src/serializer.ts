import { Trajectory } from "@opendistil/core";
import { writeFileSync } from "fs";

export class Serializer {
  serializeToJson(trajectory: Trajectory): string {
    return JSON.stringify(trajectory, null, 2);
  }

  serializeToJsonl(trajectories: Trajectory[]): string {
    return trajectories.map((t) => JSON.stringify(t)).join("\n");
  }

  saveToFile(trajectory: Trajectory, filePath: string): void {
    writeFileSync(filePath, this.serializeToJson(trajectory), "utf-8");
  }

  saveBatchToFile(trajectories: Trajectory[], filePath: string): void {
    writeFileSync(filePath, this.serializeToJsonl(trajectories), "utf-8");
  }
}
