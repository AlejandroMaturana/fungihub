# ADR-NNN: [Título de la Decisión]

**Estado:** [Propuesto | Aceptado | Rechazado | Deprecado | Sustituido]  
**Fecha:** YYYY-MM-DD  
**Decisión:** [Resumen breve de la decisión tomada]

---

## Contexto

> Describe la situación que origina la necesidad de tomar esta decisión.
>
> Incluye:
> - Problema técnico o de negocio
> - Restricciones existentes
> - Estado actual del sistema
> - Motivaciones
> - Riesgos identificados

---

## Decisión

> Describe la solución elegida y cómo será aplicada.

### 1. [Área principal de decisión]

Descripción de la decisión.

Ejemplo:

```

Componente
├── Elemento A
├── Elemento B
└── Elemento C

```

---

### 2. [Reglas, políticas o comportamiento]

| Elemento | Definición | Prioridad |
|----------|------------|-----------|
| [Elemento] | [Descripción] | [Alta/Media/Baja] |

---

### 3. [Detalles de implementación]

Descripción técnica de la implementación.

Ejemplo:

- Interfaces afectadas
- Componentes modificados
- Flujo de datos
- Comunicación entre módulos
- Configuraciones relevantes

---

## Alternativas Consideradas

### Alternativa 1: [Nombre]

**Descripción:**

[Explicación]

**Motivo de descarte:**

[Razón]

---

### Alternativa 2: [Nombre]

**Descripción:**

[Explicación]

**Motivo de descarte:**

[Razón]

---

## Consecuencias

### Positivas

- [Beneficio obtenido]
- [Mejora técnica]
- [Impacto positivo]

### Negativas

- [Costo agregado]
- [Complejidad introducida]
- [Limitaciones]

---

## Implementación

Componentes relacionados:

| Archivo / Módulo | Cambio |
|------------------|--------|
| `[ruta/al/archivo]` | [Descripción] |

---

## Roadmap / Plan de Migración

```

Fase 1: [Nombre]
├── [Tarea]
├── [Tarea]

Fase 2: [Nombre]
├── [Tarea]
└── [Tarea]

````

---

## Diagramas

```mermaid
flowchart TD
    A[Estado Inicial] --> B[Decisión]
    B --> C[Estado Final]
````

---

## Reglas de Diseño

| ID           | Regla         | Severidad |
| ------------ | ------------- | --------- |
| ADR-RULE-001 | [Descripción] | HIGH      |

---

## Referencias

* `[archivo o módulo]` — Descripción
* `ADR-NNN` — Documento relacionado
* `docs/[ruta]` — Referencia adicional

---

## Historial de Cambios

| Versión | Fecha      | Autor   | Cambios                |
| ------- | ---------- | ------- | ---------------------- |
| 1.0     | YYYY-MM-DD | [Autor] | Creación del documento |

---

*Documento generado como parte del proceso de Architecture Decision Records de Mush2.*

```

### Cambios respecto al template DDD

| DDD | ADR |
|-|-|
| Define conocimiento del dominio | Define decisiones técnicas |
| Reglas de negocio | Trade-offs arquitectónicos |
| Modelo conceptual | Contexto → Decisión → Consecuencia |
| Diagramas de dominio | Diagramas de arquitectura/flujos |
| Referencias DDD-* | ADR relacionados |

También agregaría una convención que veo implícita en tus documentos:

```

ADR-NNN-NombreCorto.md

```

Ejemplos:

```

ADR-009-Hysteresis-Control.md
ADR-012-FreeRTOS-Architecture.md
ADR-017-Event-Bus.md

```

Esto evita terminar con una carpeta:

```

docs/
└── ADR/
├── ADR-009.md
├── ADR-012.md
└── ADR-017.md

```
