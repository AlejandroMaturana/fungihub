# ADR-020: Run Replaces CultivationCycle

**Fecha**: 2026-07-20
**Estado**: Aceptado

## Context

The previous codebase used "CultivationCycle" as the central domain entity. The term is verbose, technically imprecise in common mushroom cultivation parlance, and creates unnecessarily long identifiers across models, tables, and API paths.

## Decision

The refounded system uses **Run** as the central execution entity. A Run is an active cultivation instance that binds a Chamber and a Recipe through time.

## Consequences

- Positive: Shorter, clearer identifier across code, API, and database.
- Positive: Eliminates confusion between Cycle (the domain entity) and CycleState (the history snapshot).
- Negative: Database migration or rename needed to carry this forward. In practice, since we are rebuilding, there is no migration — the new `runs` table replaces `cultivation_cycles`.
