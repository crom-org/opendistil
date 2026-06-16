import { Dataset } from "../types/dataset";
import { ValidationResult, TrajectoryValidator } from "./trajectoryValidator";

export class DatasetValidator {
  private trajectoryValidator = new TrajectoryValidator();

  validate(dataset: Dataset): ValidationResult {
    const errors = [];
    const warnings = [];

    if (!dataset.id) errors.push({ field: "id", message: "Dataset id is required", severity: "error" as const });
    if (!dataset.name) errors.push({ field: "name", message: "Dataset name is required", severity: "error" as const });
    if (!dataset.version) errors.push({ field: "version", message: "Dataset version is required", severity: "error" as const });

    if (!dataset.records || dataset.records.length === 0) {
      warnings.push({ field: "records", message: "Dataset has no records" });
    } else {
      for (let i = 0; i < dataset.records.length; i++) {
        const trajResult = this.trajectoryValidator.validate(dataset.records[i].trajectory);
        for (const err of trajResult.errors) {
          errors.push({
            field: `records[${i}].${err.field}`,
            message: err.message,
            severity: err.severity,
          });
        }
        for (const warn of trajResult.warnings) {
          warnings.push({
            field: `records[${i}].${warn.field}`,
            message: warn.message,
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
