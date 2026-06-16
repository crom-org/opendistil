# Architecture

OpenDistil follows a layered architecture with strict separation of concerns:

## Layers

1. **Presentation Layer** - CLI and SDK
2. **Orchestration Layer** - Orchestrator, Task Generator, Runner, Recorder
3. **Domain Layer** - Canonical Model, Validator, Exporter Pipeline, Plugin System
4. **Infrastructure Layer** - Environment Provider, Storage, Telemetry

## Core Design Principles

- **Data Fidelity**: All event information is preserved in the canonical model
- **Separation of Capture and Representation**: Canonical format is rich; export formats are derived projections
- **Provider Agnosticism**: Environments are pluggable via `IEnvironmentProvider`
- **Provenance First**: Metadata (model, environment, agent version, timestamp) are first-class fields

## Package Dependency Graph

```
cli → sdk → [core, recorder, runner, environments, exporters, task-generator, datasets, telemetry]
```

## Canonical Model

The canonical trajectory model captures:

- Full message history
- Tool call arguments, results, and timing
- Execution steps (thinking, tool execution, messages)
- Rich metadata (provenance, statistics, tags)
