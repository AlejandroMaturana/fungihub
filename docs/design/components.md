# Componentes — Mush2 Frontend

> Catálogo completo de componentes organizados por capas.
> Cada componente listado con su **ubicación**, **props API**, **estados visuales** y **reglas de uso**.

---

## 1. Layer Architecture

```
┌─────────────────────────────────────────────────────┐
│                    LAYOUT                            │
│  AppShell, Sidebar, TopBar, BottomNav, StatusFooter  │
│  Solo estructura. Sin estado propio. Sin API calls   │
├─────────────────────────────────────────────────────┤
│                     PAGES                            │
│  Home, Dashboard, DeviceDetail, Recipes, Cycles,     │
│  Settings, Provisioning, Landing                     │
│  Orquestan API + SSE + composites. Una por ruta.    │
├─────────────────────────────────────────────────────┤
│                   COMPOSITES                         │
│  MetricCard, StatusBadge, TerminalLog,               │
│  ActuatorControl, OfflineOverlay, ChartPanel,        │
│  SystemAlert, AuthModal, DevicesEmptyState,          │
│  RecipesEmptyState, DeviceHistoryChart               │
│  Combinan primitives + datos. Props: data callbacks. │
├─────────────────────────────────────────────────────┤
│                   PRIMITIVES                         │
│  Gauge, ArcGauge, DomeGauge, ToggleSwitch,           │
│  SegmentedBar, Skeleton, EmptyState, ErrorState,     │
│  LoadingState, OfflineBanner, ErrorBoundary          │
│  Sin lógica de negocio. Sin imports de API.         │
└─────────────────────────────────────────────────────┘
```

### Layer rules (aplica en code review)

- **Primitive** → no importa composites ni pages. No llama API.
- **Composite** → puede importar primitives y llamar API (solo acciones de usuario).
- **Page** → puede importar todo. Orchesta datos + estado. No contiene lógica de renderizado reutilizable.
- **Layout** → no importa pages. Sin estado propio.

---

## 2. Layout components

### AppShell

```
Ruta:    src/components/layout/AppShell.jsx
Export:  export default function AppShell({ user, onLogout, children })
```

Estructura que renderiza:
```
<div.app-shell>
  <Sidebar />
  <TopBar user={user} onLogout={onLogout} />
  <main.app-content>
    <OfflineBanner />
    {children}
  </main>
  <BottomNav />
  <StatusFooter />
</div>
```

### Sidebar

```
Ruta:    src/components/layout/Sidebar.jsx
Export:  export default function Sidebar()
Props:   ninguna
Ítems:   Hub(/), Dashboard, Recipes, Cycles, Settings
```

- El item activo usa `.sidebar-item.active` → `bg-surface-variant` + `text-spore-green` + `FILL 1`
- Decorado con `.sidebar-divider` entre navegación principal y settings
- Icon buttons inferiores: help, terminal

### TopBar

```
Ruta:    src/components/layout/TopBar.jsx
Export:  export default function TopBar({ user, onLogout })
Props:   user: { username: string }, onLogout: fn
```

- Brand: "MUSH2" (`.topbar-brand`)
- Nav links: Dashboard(/), Recipes, Cycles, Settings
- Right: notificaciones, settings icon, user avatar (primera letra), logout

### BottomNav

```
Ruta:    src/components/layout/BottomNav.jsx
Export:  export default function BottomNav()
Props:   ninguna
Ítems:   Home(/), Dashboard, Recipes, Cycles, Settings
```

- Visible solo en `max-width: 480px` (`.bottom-nav { display: none }` → `display: flex`)
- `env(safe-area-inset-bottom)` para notch

### StatusFooter

```
Ruta:    src/components/layout/StatusFooter.jsx
Export:  export default function StatusFooter()
Props:   ninguna
Contenido: "Mush2 OS v2.4.1 | SYS_UPTIME: --:--:--"
```

---

## 3. Primitives

### Gauge

```
Ruta:    src/components/ui/Gauge.jsx
Export:  export default function Gauge({ variant, value, min = 0, max = 100, unit, label, size = 'md' })
```

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'half' \| 'donut'` | `'donut'` | Tipo de gauge |
| `value` | `number` | — | Valor actual |
| `min` | `number` | `0` | Mínimo del rango |
| `max` | `number` | `100` | Máximo del rango |
| `unit` | `string` | — | Sufijo (ej: "%") |
| `label` | `string` | — | Etiqueta (solo half) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del gauge |

Coloreado automático por zona vía `getZoneColor(value, min, max)`:
- `< 20%` o `> 80%` → `var(--error-red)`
- `< 30%` o `> 70%` → `var(--amber)`
- `30-70%` → `var(--spore-green)`

### ArcGauge

```
Ruta:    src/components/ui/ArcGauge.jsx
Export:  export default function ArcGauge({ value, min = 0, max = 100, unit = '%', color = 'primary', size = 'md', label, trend, errorState, errorMessage })
```

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `color` | `'primary' \| 'secondary' \| 'tertiary' \| 'error'` | `'primary'` | Color del arco |
| `trend` | `string` (SVG polyline points) | — | Sparkline de tendencia |
| `errorState` | `boolean` | — | Modo de error |
| `errorMessage` | `string` | — | Mensaje de error |

### DomeGauge

```
Ruta:    src/components/ui/DomeGauge.jsx
Export:  export default function DomeGauge({ value, prevValue, min, max, optMin, optMax, unit, label, decimals = 1, history = [], noData })
```

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `prevValue` | `number` | — | Valor anterior (delta) |
| `optMin` | `number` | — | Límite inferior rango óptimo |
| `optMax` | `number` | — | Límite superior rango óptimo |
| `history` | `number[]` | `[]` | Array 12 valores historicos (sparkline) |
| `noData` | `boolean` | — | Muestra "--" sin datos |

Contiene:
- SVG semicírculo con needle animado (`transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)`)
- Barra de gradiente óptimo (azul → verde → rojo)
- Sparkline de 12 barras en base
- Indicador de delta (↑ / ↓)
- `aria-label` para accesibilidad

### ToggleSwitch

```
Ruta:    src/components/ui/ToggleSwitch.jsx
Export:  export default function ToggleSwitch({ checked, onChange, disabled })
```

ARIA: `role="switch"`, `aria-checked`, `tabIndex`, keyboard (Enter/Space).
CSS classes: `.toggle-switch.on` / `.toggle-switch.off`, `.toggle-knob`.

### SegmentedBar

```
Ruta:    src/components/ui/SegmentedBar.jsx
Export:  export default function SegmentedBar({ active = 0, total = 20, color = 'primary' })
```

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `active` | `number` | `0` | Segmentos activos |
| `total` | `number` | `20` | Total de segmentos |
| `color` | `'primary' \| 'secondary' \| 'amber' \| 'error'` | `'primary'` | Color de segmentos activos |

### Skeleton

```
Ruta:    src/components/ui/Skeleton.jsx
Exports:
  SkeletonCard()
  SkeletonGrid({ count = 4 })
  SkeletonMetric()
  SkeletonTable({ rows = 3, cols = 4 })
```

| Export | Descripción |
|--------|-------------|
| `SkeletonCard` | 3 líneas (title, text, short) en `.skeleton-card` |
| `SkeletonGrid` | Grid de `count` skeleton cards |
| `SkeletonMetric` | 2 líneas (value + label) en `.skeleton-metric` |
| `SkeletonTable` | Grid `rows x cols` de celdas |

### EmptyState

```
Ruta:    src/components/ui/EmptyState.jsx
Export:  export default function EmptyState({ icon = 'inbox', title, message, action })
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `action` | `{ label: string, onClick: fn }` | Botón de acción opcional |

### ErrorState

```
Ruta:    src/components/ui/ErrorState.jsx
Export:  export default function ErrorState({ message, onRetry })
```

- Default message: `'CONNECTION_LOST'`
- Default button: `'RETRY_UPLINK'`

### LoadingState

```
Ruta:    src/components/ui/LoadingState.jsx
Export:  export default function LoadingState({ message = 'Loading...', icon = 'sync' })
```

Centrado vertical `min-h-[60vh]`, ícono animado + mensaje.

### OfflineBanner

```
Ruta:    src/components/ui/OfflineBanner.jsx
Export:  export default function OfflineBanner()
```

Sin props. Usa `navigator.onLine` internamente vía `useEffect`. Banner rojo "CONNECTION LOST".

### ErrorBoundary

```
Ruta:    src/components/ui/ErrorBoundary.jsx
Export:  class ErrorBoundary extends Component
```

Class component. Fallback: "FATAL_EXCEPTION" + "REBOOT_SYSTEM" button.

---

## 4. Composites

### MetricCard

```
Ruta:    src/components/ui/MetricCard.jsx
Export:  export default function MetricCard({ icon, label, value, unit, trend, className, children })
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `icon` | `string` | Nombre Material Symbol |
| `trend` | `number` | Positivo = green ↑, negativo = red ↓ |
| `children` | `ReactNode` | Contenido extra bajo value row |

Base CSS: `.glass-card.p-4.rounded-xl.flex.flex-col.gap-3`

> ⚠️ También existe `src/components/dashboard/MetricCard.jsx` (legacy). Usar la versión de `ui/` para componentes nuevos.

### StatusBadge

```
Ruta:    src/components/ui/StatusBadge.jsx
Export:  export default function StatusBadge({ status = 'online', label, pulse = true })
```

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `status` | `'online' \| 'offline' \| 'critical'` | `'online'` | Estado |
| `pulse` | `boolean` | `true` | Animación de pulso en dot |

CSS: `.status-badge.{status}` → contiene `.status-dot.{status}` con opcional `.pulse`.

### TerminalLog

```
Ruta:    src/components/ui/TerminalLog.jsx
Export:  export default function TerminalLog({ entries = [], onExtract })
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `entries` | `Array<{ ts: string, text: string, type?: 'info' \| 'ok' \| 'warn' \| 'err' }>` | Entradas del log |
| `onExtract` | `fn` | Botón "FULL_EXTRACT.SH" |

Tipos de entrada: `.msg-ok` (spore-green), `.msg-warn` (amber), `.msg-err` (error-red), `.msg-info` (on-surface-variant).

### ActuatorControl

```
Ruta:    src/components/device/ActuatorControl.jsx
Export:  export default function ActuatorControl({ actuator, meta, cmdState, onToggle, disabled })
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `actuator` | `{ channel, state, mode }` | Datos del actuador |
| `meta` | `{ label, icon, sublabel }` | Metadatos (usa DEFAULT_META si no se provee) |
| `cmdState` | `'PENDING' \| 'TIMEOUT' \| string` | Estado del comando |
| `onToggle` | `(channel) => void` | Callback toggle |

Estados visuales: ON (verde), OFF (standby), ERROR/TIMEOUT (rojo), PENDING (amber).
Contiene Toggle local con inline styles.

### SystemAlert

```
Ruta:    src/components/ui/SystemAlert.jsx
Export:  export default function SystemAlert({ message, onReconnect, onViewLogs })
```

Modal crítico a pantalla completa con:
- Línea de escaneo animada (`.scan`)
- Countdown circular SVG con auto-retry cada 8s
- Botones: "FORCE RECONNECT", "VIEW SYSTEM LOGS"
- Efecto glitch en línea decorativa
- Esquinas decorativas

### ChartPanel

```
Ruta:    src/components/ui/ChartPanel.jsx
Export:  export default function ChartPanel({ deviceId, telemetry, has })
```

| Prop | Tipo | Descripción |
|------|------|-------------|
| `deviceId` | `string` | ID del dispositivo para fetch |
| `telemetry` | `{ temperature, humidity, co2, voc }` | Datos actuales |
| `has` | `{ temp, hum, eco2, tvoc }` | Flags de sensores disponibles |

- Dos paneles Chart.js: Temp+Hum (izquierda), eCO₂+TVOC (derecha)
- Bands de rango óptimo dibujadas como plugin Chart.js
- Time ranges: 15m, 1H, 6H, 1D, 3D, 7D
- Toggle de visibilidad por sensor
- Fetch interno: `getTelemetryHistory(deviceId, { limit, resolution })`

### DeviceHistoryChart

```
Ruta:    src/components/ui/DeviceHistoryChart.jsx
Export:  export default function DeviceHistoryChart({ title, datasets, bands, labels, margin = 0.10 })
```

Chart.js wrapper reutilizable. Sin fetch interno — recibe datos por props.
Mismos patrones de tooltip, grid, font que ChartPanel.

### DevicesEmptyState

```
Ruta:    src/components/ui/DevicesEmptyState.jsx
Export:  export default function DevicesEmptyState({ onConnect })
```

- Ícono grande `sensors_off` con glow
- Botones: "ADD DEVICE" (navega a /provisioning), "RETRY"
- Navegación interna vía `useNavigate`

### RecipesEmptyState

```
Ruta:    src/components/ui/RecipesEmptyState.jsx
Export:  export default function RecipesEmptyState({ onCreate })
```

- Ícono grande `potted_plant` con glow
- Botón: "CREATE RECIPE"

### OfflineOverlay

```
Ruta:    src/components/ui/OfflineOverlay.jsx
Export:  export default function OfflineOverlay({ lastSeen = '--:--:--', onRetry })
```

Overlay absoluto con backdrop blur. Muestra "CONNECTION INTERRUPTED", timestamp "LAST SEEN", botón "RETRY CONNECTION" con spinner.

### AuthModal

```
Ruta:    src/components/auth/AuthModal.jsx
Export:  ???
```

Modal de autenticación. (Ver `Landing.jsx` y `useAuth.js` para flujo completo.)

---

## 5. Pages

Cada página sigue la estructura de 4 estados:

```jsx
if (loading) return <LoadingState />
if (error && data.length === 0) return <ErrorState message={error} onRetry={refetch} />
if (data.length === 0) return <EmptyState />

return <div>{/* contenido real */}</div>
```

| Ruta | Componente | Archivo |
|------|-----------|--------|
| `*` (no auth) | `Landing` | `pages/Landing.jsx` |
| `/` | `Home` | `pages/Home.jsx` |
| `/dashboard` | `Dashboard` | `pages/Dashboard.jsx` |
| `/devices/:id` | `DeviceDetail` | `pages/DeviceDetail.jsx` |
| `/recipes` | `Recipes` | `pages/Recipes.jsx` |
| `/cycles` | `Cycles` | `pages/Cycles.jsx` |
| `/settings` | `Settings` | `pages/Settings.jsx` |
| `/provisioning` | `Provisioning` | `pages/Provisioning.jsx` |

---

## 6. Sistema de botones

| Clase | Estilo | Uso |
|-------|--------|-----|
| `.btn.btn-primary` | Fondo spore-green, texto on-primary | Acción principal |
| `.btn.btn-secondary` | Borde outline-variant, transparente | Acción secundaria |
| `.btn.btn-danger` | Fondo error/20, borde error/40 | Destrucción/riesgo |
| `.btn.btn-ghost` | Transparente, hover spore-green | Acción sutil |
| `.btn.btn-surface` | Fondo surface-container-high | Acción neutral |

Todas las variantes comparten: `.btn` → `font-mono, 10px, weight 700, letter-spacing 0.1em, uppercase`.

---

## 7. Convenciones de código

| Regla | Estándar |
|-------|----------|
| **Archivos** | PascalCase para componentes (`ArcGauge.jsx`), camelCase para hooks/utilidades (`useSSE.js`) |
| **Exports** | `export default function ComponentName()` — sin default anónimo |
| **Props** | Desestructurar en la firma. Tipado opcional (JS puro). |
| **Event handlers** | `handleToggle`, `handleSubmit`, `handleRetry`. Pasar referencias, no arrow functions inline. |
| **Loading/error** | `useState` local en la page, nunca elevado al layout. |
| **React.memo** | En primitives con props que cambian frecuentemente (Gauge, SegmentedBar). |
| **List keys** | Usar `id` del backend, nunca índice del array. |
| **SSE cleanup** | `return () => { cancelled = true }` en useEffect. |
| **Fetch** | Solo en pages y composites (ChartPanel). Primitives reciben datos por props. |
