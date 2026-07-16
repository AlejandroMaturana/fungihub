# Bioactive Traceability

## Overview

Bioactive traceability allows cultivators to record lab analyses of bioactive compounds (beta-glucans, triterpenes, erinacins, cordycepin, PSK/PSP) and correlate them with environmental conditions during each cultivation cycle.

## Data Model

### BioactiveProfile

Each record represents a single compound analysis:

| Field | Type | Description |
|---|---|---|
| `id` | INTEGER PK | Auto-increment |
| `cycleId` | INTEGER FK | References CultivationCycle |
| `compoundName` | STRING | e.g. `beta_glucans`, `triterpenes`, `erinacin_H` |
| `concentration` | FLOAT | Measured value |
| `unit` | STRING | Default `mg/g` |
| `analysisDate` | DATE | When analysis was performed |
| `labSource` | STRING | e.g. `HPLC`, `spectrophotometry` |
| `notes` | TEXT | Optional notes |
| `timestamp` | DATE | Record creation timestamp |
| `createdAt` / `updatedAt` | DATE | Sequelize timestamps |

## API Endpoints

All endpoints require Bearer token authentication.

### List bioactives for a cycle
```
GET /api/v1/cycles/:id/bioactives
```

Query params:
- `compoundName` — filter by compound name
- `from` / `to` — date range filter (ISO 8601)
- `limit` — max results (default 100)

### Add a bioactive analysis
```
POST /api/v1/cycles/:id/bioactives
```

Body:
```json
{
  "compoundName": "beta_glucans",
  "concentration": 32.5,
  "unit": "mg/g",
  "analysisDate": "2026-07-13T10:00:00Z",
  "labSource": "HPLC",
  "notes": "Post-harvest batch A"
}
```

### Get compound correlation with environment
```
GET /api/v1/cycles/:id/bioactives/correlation
```

Returns:
- `compounds[]` — avg/min/max concentration per compound with sample count
- `environmentByPhase{}` — avg/min/max temp, humidity, CO2 per phase
- `insights[]` — auto-generated observations

### Get environment summary
```
GET /api/v1/cycles/:id/environment-summary
```

Returns snapshot and state counts for the cycle.

## Frontend

- **`/cycles/:id/bioactives`** — BioactiveDashboard page
  - Add new analysis form
  - Compound summary bars (avg concentration with range)
  - Environment by phase breakdown
  - Auto-generated insights
  - Full analysis history table

- **`/cycles`** — CycleCard shows "BIOACTIVES" link for active/completed cycles

## Service: bioactiveAnalyzer

`getCorrelation(cycleId)`:
- Queries all BioactiveProfiles and CycleStates for the cycle
- Aggregates compounds: avg, min, max, sample count
- Groups environment data by phase
- Generates insights (high/low concentration, multi-sample compounds, phase-level observations)

## Predefined Compound Names

| Compound | Species | Notes |
|---|---|---|
| `beta_glucans` | All | Immune-modulating polysaccharides |
| `triterpenes` | Ganoderma | Anti-inflammatory |
| `erinacin_H` | Hericium | NGF stimulant |
| `erinacin_S` | Hericium | NGF stimulant |
| `cordycepin` | Cordyceps | Anti-tumor |
| `PSK` | Trametes | Proteoglucan |
| `PSP` | Trametes | Proteoglucan |
