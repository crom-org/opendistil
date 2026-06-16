# CLI Reference

## Commands

### `opendistil generate`

Generate a dataset by executing tasks with an agent.

```
Options:
  --tasks <file>       Path to tasks JSON file (required)
  --model <id>         Model ID (default: claude-sonnet-4-20250514)
  --env <type>         Environment type: podman, docker, local (default: podman)
  --output <dir>       Output directory (default: ./datasets)
  --max-concurrent <n> Maximum concurrent executions (default: 1)
  --timeout <ms>       Timeout per task in milliseconds (default: 300000)
  --format <formats>   Export formats: openai, anthropic, sharegpt, jsonl (default: jsonl)
```

### `opendistil export`

Export a dataset to specific formats.

```
Arguments:
  dataset              Dataset name or path

Options:
  --format <formats>   Comma-separated formats (default: all)
  --output <dir>       Output directory
```

### `opendistil validate`

Validate a dataset's integrity and quality.

```
Arguments:
  dataset              Dataset name or path

Options:
  --strict             Fail on warnings as well
  --report <file>      Output report to file
```

### `opendistil inspect`

Inspect a dataset or trajectory.

```
Arguments:
  dataset              Dataset name or path

Options:
  --trajectory <id>    Specific trajectory ID
  --json               Output as JSON
  --stats              Show statistics only
```

### `opendistil list`

List resources (datasets, environments).

```
Arguments:
  type                 Resource type: datasets, environments (default: datasets)
```
