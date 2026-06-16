import { Dataset, DatasetRecord } from "../types/dataset";

export interface ExportContext {
  dataset: Dataset;
  options: Record<string, unknown>;
}

export interface ExportResult {
  format: string;
  path: string;
  recordCount: number;
  sizeBytes: number;
  hash: string;
  timestamp: string;
}

export interface IExporter {
  readonly name: string;
  readonly format: string;
  readonly mimeType: string;

  exportRecord(record: DatasetRecord, context: ExportContext): unknown;
  exportBatch(records: DatasetRecord[], context: ExportContext): Promise<ExportResult>;
  validate(result: ExportResult): boolean;
}
