# ADR-021: Control Engine as Orchestrator

**Fecha**: 2026-07-20
**Estado**: Aceptado

## Context

In the previous implementation, controlEngine.js (483 lines) mixed cycle evaluation, actuator command computation, alarm generation/resolution, phase transitions, and fail-safe logic in a single file. This made the engine hard to reason about, test, and modify.

## Decision

The Control Engine remains a single entry point (orchestrator) but delegates specialized responsibilities to smaller, focused sub-services:

```
ControlEngine (orchestrator — every 60s)
├── PhaseEvaluator (transition rules per species)
├── ActuatorComputer (hysteresis-based command calculation)
├── AlarmService (deduplication, generation, resolution)
└── SafetyGuard (fail-safe: temp > 32°C)
```

The orchestrator is responsible for:
- Fetching active runs
- Iterating through each run
- Calling sub-services in order
- Persisting the evaluation result (RunState)
- Emitting events (commands to firmware, state to frontend)

## Consequences

- Positive: Each sub-service can be tested independently.
- Positive: The orchestrator is a thin coordinator — easy to reason about.
- Negative: Slightly more indirection than a single procedural file.
