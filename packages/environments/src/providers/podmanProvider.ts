import { execSync } from "child_process";
import { randomUUID } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { IEnvironmentProvider } from "@opendistil/core";
import {
  Environment,
  EnvironmentSpec,
  EnvironmentHealthCheck,
} from "@opendistil/core";

export class PodmanProvider implements IEnvironmentProvider {
  readonly name = "podman";
  readonly version = "1.0.0";
  private tempDir: string;

  constructor(tempDir?: string) {
    this.tempDir = tempDir ?? "/tmp/opendistil-environments";
    if (!existsSync(this.tempDir)) {
      mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async createEnvironment(spec: EnvironmentSpec): Promise<Environment> {
    const id = `opendistil-${randomUUID().slice(0, 8)}`;

    const args = [
      "podman", "run", "-d",
      "--name", id,
      "--network", spec.networkAccess ? "bridge" : "none",
    ];

    if (spec.memoryLimit) args.push("--memory", spec.memoryLimit);
    if (spec.cpuLimit) args.push("--cpus", spec.cpuLimit);

    for (const [key, value] of Object.entries(spec.envVars ?? {})) {
      args.push("-e", `${key}=${value}`);
    }

    for (const mount of spec.mountPoints ?? []) {
      args.push(
        "-v",
        `${mount.hostPath}:${mount.containerPath}${mount.readOnly ? ":ro" : ""}`,
      );
    }

    args.push(spec.image, "sleep", "infinity");

    execSync(args.join(" "), { stdio: "pipe" });

    return {
      id,
      spec,
      status: "running",
      createdAt: new Date().toISOString(),
      metadata: {
        provider: "podman",
        image: spec.image,
      },
    };
  }

  async destroyEnvironment(id: string): Promise<void> {
    execSync(`podman rm -f ${id}`, { stdio: "pipe" });
  }

  async getEnvironment(id: string): Promise<Environment | null> {
    try {
      const output = execSync(`podman inspect ${id}`, {
        encoding: "utf-8",
        stdio: "pipe",
      });
      const data = JSON.parse(output)[0];
      return {
        id,
        spec: {} as EnvironmentSpec,
        status: data.State.Status === "running" ? "running" : "error",
        createdAt: data.Created,
        metadata: data,
      };
    } catch {
      return null;
    }
  }

  async listEnvironments(filter?: Record<string, unknown>): Promise<Environment[]> {
    const output = execSync(
      'podman ps -a --filter "name=opendistil-*" --format json',
      { encoding: "utf-8", stdio: "pipe" },
    );
    const containers = JSON.parse(output || "[]");
    let environments = containers.map((c: Record<string, unknown>) => ({
      id: (c as any).Names?.[0] ?? "",
      spec: {} as EnvironmentSpec,
      status: (c as any).Status,
      createdAt: (c as any).Created,
      metadata: c,
    }));

    if (filter) {
      environments = environments.filter((env: Environment) => {
        for (const [key, value] of Object.entries(filter)) {
          if ((env as any)[key] !== value) return false;
        }
        return true;
      });
    }

    return environments;
  }

  async healthCheck(id: string): Promise<EnvironmentHealthCheck> {
    try {
      execSync(`podman exec ${id} echo "ok"`, { stdio: "pipe" });
      return { status: "healthy", lastCheck: new Date().toISOString() };
    } catch {
      return {
        status: "unhealthy",
        message: "Container not responding",
        lastCheck: new Date().toISOString(),
      };
    }
  }

  async cleanupStaleEnvironments(maxAgeMs: number): Promise<string[]> {
    const envs = await this.listEnvironments();
    const now = Date.now();
    const stale: string[] = [];

    for (const env of envs) {
      const age = now - new Date(env.createdAt).getTime();
      if (age > maxAgeMs) {
        await this.destroyEnvironment(env.id);
        stale.push(env.id);
      }
    }

    return stale;
  }
}
