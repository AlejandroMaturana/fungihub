# ADR-022: History as Active Service

**Fecha**: 2026-07-20
**Estado**: Aceptado

## Context

In the previous implementation, history data was distributed across 8+ tables (telemetry, cycle_states, phase_transitions, alarms, events, device_health, audit_logs, etc.) with no unified query mechanism. There was no way to ask "what happened during this run?" without querying multiple endpoints and assembling the result in the frontend.

## Decision

The refounded system introduces an active **HistoryService** that reconstructs the complete timeline of a Run from three sources:

1. **RunState** — snapshots created every Control Engine evaluation cycle (reads, deviations, commands)
2. **PhaseTransition** — records of every phase change with trigger data
3. **Alarm** — alarm events with their resolution lifecycle

HistoryService exposes methods like:
- `getRunTimeline(runId)` → chronological list of states + transitions + alarms
- `getRunSummary(runId)` → aggregate metrics (total alarms, phase durations, average readings)

## Consequences

- Positive: The frontend gets a unified history view with a single query.
- Positive: HistoryService encapsulates the query logic behind a clean interface.
- Negative: An additional service to maintain, but with clear responsibility.
