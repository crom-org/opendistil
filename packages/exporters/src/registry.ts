import { IExporter } from "@opendistil/core";

export class ExporterRegistry {
  private exporters: Map<string, IExporter> = new Map();

  register(exporter: IExporter): void {
    this.exporters.set(exporter.format, exporter);
  }

  unregister(format: string): void {
    this.exporters.delete(format);
  }

  get(format: string): IExporter | null {
    return this.exporters.get(format) ?? null;
  }

  getAll(): IExporter[] {
    return Array.from(this.exporters.values());
  }

  listFormats(): string[] {
    return Array.from(this.exporters.keys());
  }
}
