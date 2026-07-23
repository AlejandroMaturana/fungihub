# Roadmap y Gestión de Evolución — Mush2

Los documentos de **Roadmap** definen la evolución planificada del proyecto Mush2, organizando objetivos, hitos, fases y entregables.

El roadmap representa la visión temporal del producto y permite alinear las decisiones técnicas, desarrollo incremental y prioridades del proyecto.

Estos documentos conectan la estrategia del producto con la ejecución mediante **Milestones**, **Issues** y **Feature Stories**.

## ¿Cuándo crear o actualizar un documento Roadmap?

Actualiza el roadmap cuando:

* Se define una nueva fase de desarrollo.
* Se agregan o eliminan capacidades del producto.
* Cambia la prioridad estratégica del proyecto.
* Se completa un milestone relevante.
* Se redefine el alcance del MVP.
* Se incorporan aprendizajes que modifican la planificación.

**No** uses el roadmap para:

* Registrar decisiones técnicas específicas (usa ADR).
* Definir modelos del dominio (usa DDD).
* Documentar contratos de comunicación (usa contracts).
* Describir tareas individuales de implementación (usa Issues).

## Estructura del directorio

```text
docs/ROADMAP/
├── README.md        # Este archivo
├── roadmap.md       # Plan general de evolución del proyecto
└── milestone.md     # Definición y seguimiento de hitos
```

## Índice de documentos

| Documento                  | Descripción                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| [Roadmap](roadmap.md)      | Visión general de evolución del proyecto, fases, objetivos estratégicos, alcance y prioridades. |
| [Milestones](milestone.md) | Definición detallada de hitos, criterios de cumplimiento y entregables asociados.               |

## Relación con GitHub Issues

La ejecución del roadmap se gestiona mediante GitHub Issues y Milestones.

Los templates oficiales para crear trabajo asociado al roadmap se encuentran en:

```text
.github/issue_template/
├── bug-report.md
├── epic.md
└── feature-story.md
```

| Template           | Uso                                                               |
| ------------------ | ----------------------------------------------------------------- |
| `epic.md`          | Grandes capacidades o iniciativas que requieren múltiples tareas. |
| `feature-story.md` | Funcionalidades concretas orientadas a usuario o sistema.         |
| `bug-report.md`    | Registro de errores, regresiones o problemas técnicos.            |

## Flujo de trabajo

```text
Roadmap
   ↓
Milestone
   ↓
Epic
   ↓
Feature Story / Bug Report
   ↓
Issue
   ↓
Implementación
```
