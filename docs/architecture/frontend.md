# Arquitectura del Frontend — Mush2

## Stack

| Capa          | Tecnología                     |
| ------------- | ------------------------------ |
| Framework     | React 18                       |
| Build tool    | Vite                           |
| Routing       | React Router v6                |
| Estado global | Context API + useReducer       |
| HTTP          | axios                          |
| Tiempo real   | EventSource (SSE)              |
| Gráficos      | Chart.js + react-chartjs-2     |
| Estilos       | CSS Modules                    |
| Pruebas       | Vitest + React Testing Library |
| Linting       | ESLint + Prettier              |

## Estructura de Directorios

```
frontend/
│
├───dist
│   │   favicon.ico
│   │   index.html
│   │   preview.svg
│
├───public
│       favicon.ico
│       preview.svg
│
└───src
    │   App.jsx                     # Layout + Routing
    │   index.css                   # Estilos globales
    │   main.jsx                    # Punto de entrada (renderiza App)
    │
    ├───api
    │       AuthContext.jsx         # Contexto de autenticación
    │       client.js               # Instancia axios con interceptors JWT
    │       useSSE.js               # Hook para Server-Sent Events
    │
    ├───components
    │   ├───auth
    │   │       AuthModal.jsx       # Modal de login/registro
    │   │
    │   ├───dashboard
    │   │       MetricCard.jsx      # Tarjeta de métricas del dashboard
    │   │
    │   ├───device
    │   │       ActuatorControl.jsx # Control de actuadores (relés, etc.)
    │   │
    │   ├───layout
    │   │       AppShell.jsx        # Contenedor principal de la app
    │   │       BottomNav.jsx       # Navegación inferior (mobile)
    │   │       Sidebar.jsx         # Sidebar de navegación (desktop)
    │   │       StatusFooter.jsx    # Footer con estado del sistema
    │   │       TopBar.jsx          # Barra superior con usuario, notificaciones, etc.
    │   │
    │   └───ui
    │           ArcGauge.jsx        # Gauge circular
    │           ChartPanel.jsx       # Panel contenedor para gráficos
    │           DeviceHistoryChart.jsx # Gráfico histórico de dispositivo
    │           DevicesEmptyState.jsx # Estado vacío para lista de dispositivos
    │           DomeGauge.jsx        # Gauge específico (ej. cúpula/temperatura)
    │           EmptyState.jsx       # Componente genérico de estado vacío
    │           ErrorBoundary.jsx    # Captura de errores en React
    │           ErrorState.jsx       # UI de error
    │           Gauge.jsx            # Componente base de gauge
    │           LoadingState.jsx     # Estados de carga
    │           MetricCard.jsx       # Tarjeta de métrica reutilizable
    │           OfflineBanner.jsx    # Banner de conexión perdida
    │           OfflineOverlay.jsx   # Overlay cuando está offline
    │           RecipesEmptyState.jsx # Estado vacío para recetas
    │           SegmentedBar.jsx     # Barra segmentada (ej. progreso)
    │           Skeleton.jsx         # Skeleton loaders
    │           StatusBadge.jsx      # Badge de estado (online/offline, error, etc.)
    │           SystemAlert.jsx      # Alertas del sistema
    │           TerminalLog.jsx      # Visualizador de logs tipo terminal
    │           ToggleSwitch.jsx     # Interruptor on/off
    │
    └───pages
            Cycles.jsx              # Página de ciclos / historial
            Dashboard.jsx           # Dashboard principal
            DeviceDetail.jsx        # Detalle de dispositivo
            Home.jsx                # Página de inicio (post-login)
            Landing.jsx             # Landing page pública
            Login.jsx               # Página de login
            Provisioning.jsx        # Página de aprovisionamiento de dispositivos
            Recipes.jsx             # Gestión de recetas
            Settings.jsx            # Configuración de la aplicación
│
├─── index.html                     # Plantilla HTML principal (Vite)
├─── package.json                   # Dependencias y scripts del proyecto
├─── README.md                      # Documentación del frontend
├─── VERSION                        # Archivo de versión actual
├─── vite-dev.err.log               # Log de errores en desarrollo
├─── vite-dev.log                   # Log de desarrollo
└─── vite.config.js                 # Configuración de Vite (plugins, proxy, etc.)

```

## Flujo de Autenticación

```
Login → POST /api/v1/auth/login
  → Recibe { token, refreshToken, user }
  → Almacena token en sessionStorage
  → Configura axios interceptor (Authorization: Bearer)
  → Redirige a Dashboard

Token expirado (401)
  → Interceptor captura error
  → POST /api/v1/auth/refresh con refreshToken
  → Si ok: renueva token y reintenta request
  → Si fail: redirige a Login
```

## Tiempo Real (SSE)

```javascript
// hooks/useSSE.js
const useSSE = (url) => {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = getToken();
    const eventSource = new EventSource(`${url}?token=${token}`);

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => setConnected(false);

    eventSource.addEventListener("telemetry", (e) => {
      setData(JSON.parse(e.data));
    });

    eventSource.addEventListener("actuator", (e) => {
      // Actualizar estado actuador en UI
    });

    eventSource.addEventListener("alarm", (e) => {
      // Mostrar notificación
    });

    return () => eventSource.close();
  }, [url]);

  return { data, connected };
};
```

## Routing

```
/login              → Login (público)
/register           → Register (público)
/                   → Dashboard (protegido)
/devices            → Lista dispositivos (protegido)
/devices/:id        → Detalle + control (protegido)
/recipes            → Recetas (protegido)
/recipes/new        → Nueva receta (protegido)
/recipes/:id/edit   → Editar receta (protegido)
/cycles             → Ciclos de cultivo (protegido)
/alarms             → Alarmas (protegido)
/analytics          → Analytics (protegido)
/settings           → Perfil / Suscripción (protegido)
*                   → 404
```

## Decisiones de Diseño

1. **SSE vs WebSocket**: Se elige SSE por simplicidad (unidireccional servidor→cliente). El frontend solo necesita recibir eventos en tiempo real, no enviar.
2. **Context API vs Redux**: Se usa Context API + useReducer para evitar dependencias pesadas. Si el estado crece demasiado, se migrará a Zustand.
3. **CSS Modules vs Tailwind**: Se parte con CSS Modules por tipado explícito. Se evaluará Tailwind en fase de diseño de componentes si la velocidad de prototipado lo requiere.
4. **Lazy Loading**: Cada página se carga con `React.lazy()` + `Suspense` para reducir bundle inicial.
