import { Dataset, DatasetRecord, Trajectory } from "@opendistil/core";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

export class DatasetManager {
  private datasets: Map<string, Dataset> = new Map();
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir ?? join(process.cwd(), ".opendistil", "datasets");
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
  }

  create(name: string, description: string, version?: string): Dataset {
    const dataset: Dataset = {
      id: `ds-${randomUUID().slice(0, 8)}`,
      name,
      description,
      version: version ?? "0.1.0",
      records: [],
      createdAt: new Date().toISOString(),
      metadata: {},
    };

    this.datasets.set(dataset.id, dataset);
    return dataset;
  }

  addTrajectory(datasetId: string, trajectory: Trajectory): DatasetRecord {
    const dataset = this.datasets.get(datasetId);
    if (!dataset) throw new Error(`Dataset "${datasetId}" not found`);

    const record: DatasetRecord = {
      trajectory,
      derivedFormats: {
        openai: null,
        anthropic: null,
        sharegpt: null,
        jsonl: null,
      },
    };

    dataset.records.push(record);
    return record;
  }

  get(id: string): Dataset | null {
    return this.datasets.get(id) ?? null;
  }

  list(): Dataset[] {
    return Array.from(this.datasets.values());
  }

  save(dataset: Dataset): void {
    const dir = join(this.storageDir, dataset.name);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const trajectoriesDir = join(dir, "trajectories");
    if (!existsSync(trajectoriesDir)) {
      mkdirSync(trajectoriesDir, { recursive: true });
    }

    for (let i = 0; i < dataset.records.length; i++) {
      const trajPath = join(trajectoriesDir, `traj-${String(i + 1).padStart(3, "0")}.json`);
      writeFileSync(trajPath, JSON.stringify(dataset.records[i].trajectory, null, 2), "utf-8");
    }

    const metadataPath = join(dir, "dataset.json");
    writeFileSync(metadataPath, JSON.stringify({
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      version: dataset.version,
      recordCount: dataset.records.length,
      createdAt: dataset.createdAt,
    }, null, 2), "utf-8");
  }

  load(name: string): Dataset | null {
    const dir = join(this.storageDir, name);
    if (!existsSync(dir)) return null;

    const metadataPath = join(dir, "dataset.json");
    const metadata = JSON.parse(readFileSync(metadataPath, "utf-8"));

    const dataset: Dataset = {
      id: metadata.id,
      name: metadata.name,
      description: metadata.description,
      version: metadata.version,
      records: [],
      createdAt: metadata.createdAt,
      metadata: {},
    };

    const trajectoriesDir = join(dir, "trajectories");
    if (existsSync(trajectoriesDir)) {
      const files = readdirSync(trajectoriesDir).filter((f: string) => f.endsWith(".json"));
      for (const file of files) {
        const traj = JSON.parse(readFileSync(join(trajectoriesDir, file), "utf-8"));
        dataset.records.push({
          trajectory: traj,
          derivedFormats: { openai: null, anthropic: null, sharegpt: null, jsonl: null },
        });
      }
    }

    this.datasets.set(dataset.id, dataset);
    return dataset;
  }
}
