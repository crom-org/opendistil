export class Statistics {
  static mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  static median(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static stddev(values: number[]): number {
    if (values.length <= 1) return 0;
    const mean = this.mean(values);
    const squaredDiffs = values.map((v) => (v - mean) ** 2);
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1));
  }

  static percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  static distribution(values: number[], bucketCount: number = 10): Record<string, number> {
    if (values.length === 0) return {};
    const min = Math.min(...values);
    const max = Math.max(...values);
    const bucketSize = (max - min) / bucketCount || 1;
    const distribution: Record<string, number> = {};

    for (let i = 0; i < bucketCount; i++) {
      const lower = min + i * bucketSize;
      const upper = lower + bucketSize;
      const label = `${lower.toFixed(1)}-${upper.toFixed(1)}`;
      distribution[label] = values.filter((v) => v >= lower && v < upper).length;
    }

    return distribution;
  }
}
