import { Environment, EnvironmentSpec, EnvironmentHealthCheck } from "../types/environment";

export interface IEnvironmentProvider {
  readonly name: string;
  readonly version: string;

  createEnvironment(spec: EnvironmentSpec): Promise<Environment>;
  getEnvironment(id: string): Promise<Environment | null>;
  listEnvironments(filter?: Record<string, unknown>): Promise<Environment[]>;
  healthCheck(id: string): Promise<EnvironmentHealthCheck>;
  destroyEnvironment(id: string): Promise<void>;
  cleanupStaleEnvironments(maxAgeMs: number): Promise<string[]>;
}
