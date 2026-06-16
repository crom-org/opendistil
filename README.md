# OpenDistil

Open-source platform for generating high-quality agent trajectory datasets for training AI agents with tool-calling capabilities.

## Installation

```bash
npm install -g opendistil
```

## Quick Start

```bash
# Generate a dataset
opendistil generate --tasks ./tasks.json --env local --output ./my-dataset

# Export to training formats
opendistil export ./my-dataset --format all

# Validate quality
opendistil validate ./my-dataset --strict
```

## Programmatic SDK

```typescript
import { OpenDistil } from "opendistil";

const client = new OpenDistil();
const result = await client.generate({
  tasks: myTasks,
  modelId: "claude-sonnet-4-20250514",
  modelProvider: "anthropic",
  environmentType: "local",
  outputDir: "./dataset",
  exportFormats: ["openai", "anthropic", "jsonl"],
});
```

## Architecture

OpenDistil is a TypeScript monorepo with 9 packages:

| Package | Description |
|---------|-------------|
| `@opendistil/core` | Canonical model, interfaces, validation |
| `@opendistil/recorder` | Event capture and trajectory building |
| `@opendistil/runner` | Agent session execution |
| `@opendistil/environments` | Podman, Docker, and local providers |
| `@opendistil/exporters` | Multi-format export pipeline |
| `@opendistil/task-generator` | Task definition and generation |
| `@opendistil/datasets` | Dataset management and quality |
| `@opendistil/telemetry` | Metrics and event logging |
| `opendistil` (SDK) | Public API and orchestrator |

## License

Apache 2.0
