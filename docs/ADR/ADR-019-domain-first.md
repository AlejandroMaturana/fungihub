# ADR-019: Domain-First Architecture

**Fecha**: 2026-07-20
**Estado**: Aceptado

## Context

MUSH2's previous implementation was built incrementally, with models, services, and endpoints emerging from implementation convenience rather than domain analysis. The resulting codebase had 24 models, duplications, unmounted routes, and unclear responsibilities.

## Decision

The refounded MUSH2 will follow a strict domain-first approach:

1. The domain layer (pure types, value objects, domain services) is built first, with zero dependencies on infrastructure.
2. Use cases (application services) are built second, orchestrating domain logic.
3. The Control Engine is built third, as a specialized orchestrator.
4. Persistence, API, backend, and frontend are built after the domain is validated.

This order guarantees that every infrastructure decision serves a domain need. No component exists because "it was there before" — every component justifies its existence against the MVP flow.

## Consequences

- Positive: The domain is testable in isolation without a database or HTTP server.
- Positive: Technology choices emerge from domain needs, not habits.
- Negative: More upfront design time before writing executable code.
- Negative: ORM models must be derived from domain types, not the reverse.
