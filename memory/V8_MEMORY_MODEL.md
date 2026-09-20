# FCC v8 Memory Model

- `memory/` — durable learning, decisions, patterns and experiments.
- `tasks/` — transient operational state and task artifacts.
- `knowledge/` — external sources with provenance and freshness.
- `state/control-center/` — runtime events and telemetry.

Legacy flat memory remains authoritative history during migration; new durable entries should link to task/experiment IDs.
