# Domain-Driven Design (DDD) — Mush2 LabTech

Los documentos DDD definen el **modelo de dominio** del proyecto Mush2 estableciendo un **Lenguaje Ubicuo**, **Contextos Limitados**, **Agregados**, **Value Objects**, **Eventos de Dominio** y **Máquinas de Estado**.

## ¿Cuándo crear un documento DDD?

Crea un documento DDD cuando quieras:

- Definir o refinar el **Lenguaje Ubicuo** del dominio micológico
- Modelar **nuevas entidades** o **agregados** del dominio
- Especificar **Value Objects** compartidos entre contextos
- Documentar **Eventos de Dominio** y flujos de comunicación
- Diseñar **máquinas de estado** para entidades con ciclo de vida complejo
- Identificar **nuevos Bounded Contexts** o refinar los existentes

**No** crea un documento DDD para:

- Decisiones de infraestructura (usa ADR)
- Propuestas de cambios que requieren debate (usa RFC)
- Configuración de entorno o despliegue
- Bugs o fixes puntuales

## Estructura del directorio

```
docs/DDD/
├── README.md                      # Este archivo
├── template.md                    # Template para nuevos documentos
├── DDD-001-modelo_del_dominio.md  # Documento principal
├── DDD-002-bounded_contexts.md    # Contextos Limitados
├── DDD-003.md                     # Agregados y Raíces
├── DDD-004.md                     # Value Objects
├── DDD-005.md                     # Máquinas de Estado
├── DDD-006.md                     # Eventos de Dominio
├── DDD-007.md                     # Roadmap de Migración
├── firstDDD.context.md            # Contexto educativo inicial
└── lineamientos-previos.md        # Contexto del proyecto
```

## Índice de documentos

| ID | Documento | Descripción | Depende de |
|----|-----------|-------------|------------|
| [DDD-001](DDD-001-modelo_del_dominio.md) | Modelo de Dominio | Documento principal con Lenguaje Ubicuo, Contextos, Agregados, Value Objects, Eventos, Máquinas de Estado y Reglas de Negocio | — |
| [DDD-002](DDD-002-bounded_contexts.md) | Bounded Contexts | 4 Contextos: Cultivo, Monitoreo, Control, Usuarios | DDD-001 |
| [DDD-003](DDD-003.md) | Agregados | 5 Agregados con sus Raíces e invariantes | DDD-001, DDD-002 |
| [DDD-004](DDD-004.md) | Value Objects | ~30 Value Objects de dominio, identidad y configuración | DDD-001, DDD-003 |
| [DDD-005](DDD-005.md) | Máquinas de Estado | 7 Máquinas de Estado con diagramas y reglas | DDD-001, DDD-003 |
| [DDD-006](DDD-006.md) | Eventos de Dominio | ~20 Eventos con flujos de secuencia | DDD-001, DDD-002, DDD-003 |
| [DDD-007](DDD-007.md) | Roadmap de Migración | Plan de 8 fases (22-32 semanas) | Todos |

## Numeración

- Los documentos DDD se numeran secuencialmente: DDD-001, DDD-002, etc.
- El número es permanente; si un documento es reemplazado, se crea uno nuevo con el siguiente número.
- Los números no se reutilizan.

## Template

Ver [template.md](template.md) para el template base de un nuevo documento DDD.

## Relación con otros documentos

| Tipo | Uso | DDD no reemplaza |
|------|-----|------------------|
| **ADR** | Registro de decisiones de arquitectura | DDD define el modelo, ADR registra por qué se diseñó así |
| **RFC** | Propuestas que requieren debate | DDD documenta la decisión final del modelo |
| **Contratos** | Especificaciones de API, MQTT, BLE | DDD define el dominio que los contratos implementan |
