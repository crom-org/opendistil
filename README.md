# OpenDistil

Open-source platform for generating high-quality agent trajectory datasets for training AI agents with tool-calling capabilities.

## Installation

```bash
npm install -g @opendistil/cli
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
|----------|-------------|
| `@opendistil/cli` | OpenDistil CLI |
| `@opendistil/core` | Core types, interfaces, and validation for OpenDistil |
| `@opendistil/datasets` | Dataset management, validation, deduplication, and scoring |
| `@opendistil/environments` | Environment providers for OpenDistil (Podman, Docker, Local) |
| `@opendistil/exporters` | Multi-format dataset exporters (OpenAI, Anthropic, ShareGPT, JSONL) |
| `@opendistil/recorder` | Event recorder for capturing agent trajectories |
| `@opendistil/runner` | Agent session runner and execution controller |
| `@opendistil/task-generator` | Task generation for agent datasets |
| `@opendistil/telemetry` | Telemetry, metrics, and event logging for OpenDistil |

## License

Apache 2.0
