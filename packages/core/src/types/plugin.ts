export type PluginType =
  | "environment-provider"
  | "exporter"
  | "task-generator"
  | "validator"
  | "filter";

export type PluginHook = string;

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  hooks: PluginHook[];
}

export interface Logger {
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
  debug(msg: string, ...args: unknown[]): void;
}

export interface PluginContext {
  logger: Logger;
  config: Record<string, unknown>;
}

export interface Plugin {
  manifest: PluginManifest;
  initialize(context: PluginContext): Promise<void>;
  shutdown(): Promise<void>;
}

export interface PluginRegistry {
  register(plugin: Plugin): void;
  unregister(name: string): void;
  getPlugins(type?: PluginType): Plugin[];
  getPlugin(name: string): Plugin | null;
}
