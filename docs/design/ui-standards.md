# UI Standards — Mush2 Frontend

## 1. Stack visual

- **Theme:** `dark` siempre, fondo `#0a0f0d` (terminal-black)
- **Token system:** CSS custom properties en `:root` dentro de `src/index.css`. No usar valores hardcodeados.
- **Tipografía:**
  - `Inter` — body, headings
  - `JetBrains Mono` — data displays, labels, texto monoespaciado
- **Iconos:** Material Symbols Outlined, con `fontVariationSettings: '"FILL" 1'` para estados activos.

## 2. Arquitectura de componentes

Tres capas, cada una con reglas estrictas:

| Capa | Ejemplos | Regla |
|------|----------|-------|
| **Primitives** | `Gauge`, `ArcGauge`, `ToggleSwitch`, `SegmentedBar`, `Skeleton` | Sin lógica de negocio. Props: value, min/max/min, color, size. Sin imports de API. |
| **Composite** | `MetricCard`, `StatusBadge`, `TerminalLog`, `ActuatorControl`, `OfflineOverlay` | Combinan primitives + datos. Props: data + callbacks. Pueden llamar API directamente (solo acciones de usuario). |
| **Pages** | `Dashboard`, `DeviceDetail`, `Home`, `Recipes`, `Cycles`, `Settings` | Orquestan API + SSE + composites. Cada una es una ruta en `App.jsx`. Sin lógica de renderizado reutilizable. |
| **Layout** | `AppShell`, `Sidebar`, `TopBar`, `BottomNav`, `StatusFooter` | Solo estructura. Sin estado propio. Sin imports de API. |

### 2.1 Reglas de capas

- Una **primitive** no puede importar un **composite** o una **page**.
- Un **composite** puede importar **primitives** pero no **pages**.
- Una **page** puede importar todo lo anterior.
- Un **layout** no puede importar **pages**.

## 3. Estados obligatorios por página

Toda página debe cubrir estos 4 estados visuales. Usar los componentes existentes:

| Estado | Componente | Cuándo |
|--------|-----------|--------|
| **Loading** | `Skeleton` o spinner inline | Mientras se resuelve la promesa inicial |
| **Empty** | `DevicesEmptyState`, `RecipesEmptyState`, o `EmptyState` genérico | Array vacío sin datos |
| **Error** | `ErrorState` con mensaje + RETRY | catch de API o conexión fallida |
| **Offline** | `OfflineOverlay` (overlay con auto-retry) | SSE caído o navigator.onLine = false |

Ejemplo de estructura mínima en toda page:

```jsx
if (loading) return <LoadingState />
if (error && data.length === 0) return <ErrorState message={error} onRetry={refetch} />
if (data.length === 0) return <EmptyState />

return <div>{/* contenido real */}</div>
```

## 4. Patrones de animación

Usar las clases ya definidas en `index.css`. No crear animaciones nuevas sin justificación.

| Clase CSS | Propósito | Elementos típicos |
|-----------|-----------|-------------------|
| `.breathing-pulse` | Opacidad/escala pulsante | LEDs activos, dots de estado, nodos SVG |
| `.bioluminescent-path` | Líneas SVG animadas (dash offset) | Líneas mycelium decorativas |
| `.glow-pulse` | Sombra glow pulsante en bordes | Botones primarios, cards activas |
| `.shimmer` | Gradiente animado de carga | Skeleton, placeholders de datos |
| `.status-dot-pulse` | Pulso de estado con opacidad | Dots de estado online/critical |

### 4.1 Micro-interacciones obligatorias

- Todo botón clickeable: `hover:brightness-110 active:scale-95 transition-all`
- Todo glass card hover: `hover:bg-surface-container-high transition-all duration-300`
- Toggle switches: transición de color + posición del knob en 300ms
- Inputs focus: `box-shadow: 0 0 12px rgba(107,251,154,0.25)` + borde primary

## 5. Layout y espaciado

### 5.1 Grid system

- **Bento grid estándar:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3`
- **Grid de features:** `grid grid-cols-1 lg:grid-cols-3 gap-gutter auto-rows-[280px]`
- **Sidebar + contenido:** sidebar fixed 80px izquierda, topbar fixed 64px arriba, main con `margin-left: 80px; margin-top: 64px`

### 5.2 Glass card

```
className="bg-surface-container border border-outline-variant rounded-xl"
```

Variantes de borde-accento:
- `border-l-4 border-l-primary` — dato primario
- `border-l-4 border-l-secondary` — dato secundario
- `border-l-4 border-l-error` — estado crítico
- `border-t-2 border-t-secondary` — card de feature

### 5.3 Espaciado

Usar los tokens CSS. No usar valores absolutos (salvo 0):

```
--space-gutter: 12px       → gap entre cards
--space-stack-sm: 8px      → padding interno pequeño
--space-stack-md: 16px     → padding interno estándar
--space-unit: 4px          → unidad mínima
--space-container-padding: 24px  → padding de página
--radius-md: 6px           → bordes estándar
```

## 6. Navegación

- **Desktop (> 768px):** Sidebar vertical (80px) con íconos + labels.
- **Tablet (480-768px):** Sidebar colapsada (64px) sin labels.
- **Mobile (< 480px):** Sidebar oculta. BottomNav (64px) visible con 5 items.

Reglas:
- Toda ruta nueva debe agregarse en `Sidebar.jsx` y `BottomNav.jsx`.
- Máximo 5 items en sidebar, máximo 5 en bottom nav.
- El item activo usa `bg-surface-variant` + `text-primary` + `fontVariationSettings: '"FILL" 1'`.

## 7. Convenciones de código

- **Archivos:** PascalCase para componentes (`ArcGauge.jsx`), camelCase para hooks/utilidades (`useSSE.js`).
- **Exports:** `export default function ComponentName()` — sin default anónimo.
- **Props:** desestructurar en la firma. Tipado opcional (JS puro por ahora).
- **Eventos handlers:** `handleToggle`, `handleSubmit`, `handleRetry`. Pasar referencias, no arrow functions inline.
- **Estados de loading/error:** useState local en la page, nunca elevado al layout.

## 8. Performance

- `React.memo` en primitives que reciben props que cambian con frecuencia (Gauge, SegmentedBar).
- Evitar re-renders de listas largas: usar key estable (id del backend).
- SSE subscriptions: cancelar con `return () => { cancelled = true }` en el cleanup del useEffect.
- No hacer fetch en componentes que no son pages. Los composites reciben datos por props.

## 9. Accesibilidad mínima

- `*:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }` (ya en index.css)
- Botones sin texto: incluir `aria-label` o `title`.
- Inputs: asociar `<label htmlFor="...">` con `id` correspondiente.
- Iconos decorativos: `aria-hidden="true"` (ya es default en Material Symbols).

## 10. Glosario visual

| Término | Significado | Ejemplo |
|---------|-------------|---------|
| **Glass card** | Card semitransparente con borde sutil | `bg-surface-container border border-outline-variant` |
| **Bento grid** | Grid asimétrica de cards de distintos tamaños | Dashboard, Home features |
| **Arc gauge** | Gauge semicircular SVG con needle | Humidity, Temperature en DeviceDetail |
| **Mycelium line** | Línea SVG animada decorativa | Conexiones entre nodos en Global Mapping |
| **Segmented bar** | Barra de progreso segmentada (fases) | Días de incubación/fructificación en Recipes |
| **Logic track** | Barra gradientada (rojo→verde→rojo) con indicador | Sliders de rango ideal en mobile chamber view |
