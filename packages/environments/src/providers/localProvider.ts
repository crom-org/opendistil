import { existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";
import { IEnvironmentProvider } from "@opendistil/core";
import {
  Environment,
  EnvironmentSpec,
  EnvironmentHealthCheck,
} from "@opendistil/core";

export class LocalProvider implements IEnvironmentProvider {
  readonly name = "local";
  readonly version = "1.0.0";
  private workDir: string;
  private environments: Map<string, Environment> = new Map();

  constructor(workDir?: string) {
    this.workDir = workDir ?? "/tmp/opendistil-local";
    if (!existsSync(this.workDir)) {
      mkdirSync(this.workDir, { recursive: true });
    }
  }

  async createEnvironment(spec: EnvironmentSpec): Promise<Environment> {
    const id = `local-${randomUUID().slice(0, 8)}`;
    const envDir = join(this.workDir, id);

    if (!existsSync(envDir)) {
      mkdirSync(envDir, { recursive: true });
    }

    writeFileSync(join(envDir, "spec.json"), JSON.stringify(spec, null, 2));

    const env: Environment = {
      id,
      spec,
      status: "ready",
      createdAt: new Date().toISOString(),
      metadata: {
        provider: "local",
        workDir: envDir,
      },
    };

    this.environments.set(id, env);
    return env;
  }

  async destroyEnvironment(id: string): Promise<void> {
    const env = this.environments.get(id);
    if (env) {
      const envDir = join(this.workDir, id);
      if (existsSync(envDir)) {
        rmSync(envDir, { recursive: true, force: true });
      }
      this.environments.delete(id);
    }
  }

  async getEnvironment(id: string): Promise<Environment | null> {
    return this.environments.get(id) ?? null;
  }

  async listEnvironments(filter?: Record<string, unknown>): Promise<Environment[]> {
    let envs = Array.from(this.environments.values());
    if (filter) {
      envs = envs.filter((env) => {
        for (const [key, value] of Object.entries(filter)) {
          if ((env as any)[key] !== value) return false;
        }
        return true;
      });
    }
    return envs;
  }

  async healthCheck(_id: string): Promise<EnvironmentHealthCheck> {
    return { status: "healthy", lastCheck: new Date().toISOString() };
  }

  async cleanupStaleEnvironments(maxAgeMs: number): Promise<string[]> {
    const now = Date.now();
    const stale: string[] = [];

    for (const [id, env] of this.environments) {
      const age = now - new Date(env.createdAt).getTime();
      if (age > maxAgeMs) {
        await this.destroyEnvironment(id);
        stale.push(id);
      }
    }

    return stale;
  }
}
