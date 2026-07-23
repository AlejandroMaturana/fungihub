# Gobernanza del Proyecto — Mush2

La documentación de **Governance** define las reglas, procesos y estándares que permiten mantener la calidad, consistencia y evolución controlada del proyecto Mush2.

Estos documentos establecen cómo se toman decisiones, cómo se contribuye al código, cómo se gestionan cambios y cómo se mantiene la salud técnica del sistema durante su ciclo de vida.

La gobernanza busca evitar la degradación progresiva del proyecto mediante prácticas explícitas de desarrollo, documentación y colaboración.

## ¿Cuándo consultar o actualizar Governance?

Consulta estos documentos cuando:

* Se inicia una nueva funcionalidad.
* Se incorpora código al repositorio.
* Se debe tomar una decisión sobre arquitectura o implementación.
* Se crea un Issue, Feature o Epic.
* Se modifica la estrategia de ramas.
* Se detecta deuda técnica.
* Se requiere definir si un trabajo está terminado.

Actualiza Governance cuando:

* Cambian los procesos de desarrollo.
* Se adoptan nuevas herramientas.
* Evolucionan las reglas del repositorio.
* Una práctica existente deja de ser válida.

## Estructura del directorio

```text
docs/governance/
├── README.md                    # Este archivo
├── agent-boundaries.md          # Límites y reglas para agentes IA
├── branching-strategy.md        # Estrategia de ramas Git
├── coding-standards.md          # Estándares de código
├── contribution-guide.md        # Guía de contribución
├── decision-tree.md             # Árbol de decisión para procesos técnicos
├── definition-of-done.md        # Criterios de completitud
├── task-templates.md            # Plantillas para tareas de desarrollo
├── tech-debt.md                 # Gestión de deuda técnica
└── versioning.md                # Estrategia de versionado
```

## Índice de documentos

| Documento                                   | Descripción                                                                                                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [Agent Boundaries](agent-boundaries.md)     | Define límites, responsabilidades y restricciones para el uso de agentes de inteligencia artificial dentro del proyecto. |
| [Branching Strategy](branching-strategy.md) | Define el modelo de ramas Git, flujo de trabajo, integración y reglas de merge.                                          |
| [Coding Standards](coding-standards.md)     | Establece convenciones de desarrollo, calidad de código y criterios técnicos.                                            |
| [Contribution Guide](contribution-guide.md) | Describe cómo contribuir al proyecto, desde cambios pequeños hasta nuevas capacidades.                                   |
| [Decision Tree](decision-tree.md)           | Guía para seleccionar el proceso adecuado según el tipo de cambio o problema.                                            |
| [Definition of Done](definition-of-done.md) | Define las condiciones necesarias para considerar una tarea finalizada.                                                  |
| [Task Templates](task-templates.md)         | Plantillas y estructuras recomendadas para documentar trabajo técnico.                                                   |
| [Tech Debt](tech-debt.md)                   | Registro y estrategia para identificar, priorizar y reducir deuda técnica.                                               |
| [Versioning](versioning.md)                 | Reglas de versionado, releases y compatibilidad.                                                                         |

## Principios de Gobernanza

La evolución del proyecto se basa en los siguientes principios:

* **Trazabilidad:** toda decisión importante debe poder ser explicada posteriormente.
* **Consistencia:** las reglas del proyecto deben aplicarse de forma uniforme.
* **Calidad incremental:** cada cambio debe mejorar o mantener la calidad existente.
* **Documentación viva:** la documentación debe evolucionar junto con el sistema.
* **Cambios explícitos:** las modificaciones relevantes deben quedar registradas.
* **Automatización responsable:** las herramientas deben asistir al desarrollo sin reemplazar el criterio técnico.
