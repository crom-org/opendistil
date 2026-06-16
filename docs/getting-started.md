# OpenDistil Getting Started

## Installation

```bash
npm install -g opendistil
```

Or use directly:

```bash
npx opendistil --help
```

## Basic Usage

### Generate a Dataset

```bash
opendistil generate --tasks ./tasks.json --env local --output ./my-dataset
```

### Export a Dataset

```bash
opendistil export ./my-dataset --format all
```

### Validate a Dataset

```bash
opendistil validate ./my-dataset --strict
```

### Inspect a Dataset

```bash
opendistil inspect ./my-dataset --stats
```

## Programmatic SDK

```typescript
import { OpenDistil } from "opendistil";

const client = new OpenDistil();

const result = await client.generate({
  tasks: [
    {
      id: "task-1",
      description: "Calculate the sum of 42 and 58",
      category: "math",
      difficulty: "easy",
      toolsRequired: ["calculator"],
      expectedTools: ["calculator"],
      maxTurns: 5,
      timeoutMs: 60000,
      tags: ["math"],
    },
  ],
  modelId: "claude-sonnet-4-20250514",
  modelProvider: "anthropic",
  environmentType: "local",
  outputDir: "./my-dataset",
  exportFormats: ["openai", "jsonl"],
});

console.log(`Generated ${result.dataset.records.length} records`);
```
