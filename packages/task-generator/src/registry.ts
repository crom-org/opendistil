import { ITaskGenerator } from "@opendistil/core";

export class TaskGeneratorRegistry {
  private generators: Map<string, ITaskGenerator> = new Map();

  register(generator: ITaskGenerator): void {
    this.generators.set(generator.name, generator);
  }

  unregister(name: string): void {
    this.generators.delete(name);
  }

  get(name: string): ITaskGenerator | null {
    return this.generators.get(name) ?? null;
  }

  getAll(): ITaskGenerator[] {
    return Array.from(this.generators.values());
  }

  listNames(): string[] {
    return Array.from(this.generators.keys());
  }
}
