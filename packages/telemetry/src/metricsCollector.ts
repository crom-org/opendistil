export interface MetricPoint {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: string;
}

export class MetricsCollector {
  private metrics: MetricPoint[] = [];

  record(name: string, value: number, labels?: Record<string, string>): void {
    this.metrics.push({
      name,
      value,
      labels: labels ?? {},
      timestamp: new Date().toISOString(),
    });
  }

  increment(name: string, labels?: Record<string, string>): void {
    this.record(name, 1, labels);
  }

  getAll(): MetricPoint[] {
    return [...this.metrics];
  }

  query(name: string): MetricPoint[] {
    return this.metrics.filter((m) => m.name === name);
  }

  summarize(): Record<string, { count: number; sum: number; avg: number; min: number; max: number }> {
    const grouped: Record<string, number[]> = {};

    for (const metric of this.metrics) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric.value);
    }

    const summary: Record<string, { count: number; sum: number; avg: number; min: number; max: number }> = {};
    for (const [name, values] of Object.entries(grouped)) {
      summary[name] = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
      };
    }

    return summary;
  }

  clear(): void {
    this.metrics = [];
  }
}
