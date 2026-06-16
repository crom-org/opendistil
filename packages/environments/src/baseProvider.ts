import { IEnvironmentProvider, Environment, EnvironmentSpec, EnvironmentHealthCheck } from "@opendistil/core";

export abstract class BaseProvider implements IEnvironmentProvider {
  abstract readonly name: string;
  abstract readonly version: string;

  abstract createEnvironment(spec: EnvironmentSpec): Promise<Environment>;
  abstract destroyEnvironment(id: string): Promise<void>;
  abstract healthCheck(id: string): Promise<EnvironmentHealthCheck>;

  async getEnvironment(_id: string): Promise<Environment | null> {
    throw new Error("Method not implemented by base provider");
  }

  async listEnvironments(_filter?: Record<string, unknown>): Promise<Environment[]> {
    throw new Error("Method not implemented by base provider");
  }

  async cleanupStaleEnvironments(_maxAgeMs: number): Promise<string[]> {
    throw new Error("Method not implemented by base provider");
  }
}
