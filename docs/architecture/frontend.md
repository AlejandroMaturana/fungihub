# Arquitectura del Frontend — Mush2

## Stack

| Capa | Tecnología |
|---|---|
| Framework | React 18 |
| Build tool | Vite |
| Routing | React Router v6 |
| Estado global | Context API + useReducer |
| HTTP | axios |
| Tiempo real | EventSource (SSE) |
| Gráficos | Chart.js + react-chartjs-2 |
| Estilos | CSS Modules |
| Pruebas | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

## Estructura de Directorios

```
frontend/
├── public/
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── main.jsx              # Punto de entrada
│   ├── App.jsx               # Layout + Routing
│   ├── router.jsx            # React Router configuración
│   ├── api/
│   │   ├── client.js         # Instancia axios con interceptors JWT
│   │   ├── auth.js           # Endpoints de autenticación
│   │   ├── devices.js        # Endpoints de dispositivos
│   │   ├── telemetry.js      # Endpoints de telemetría
│   │   ├── actuators.js      # Endpoints de control
│   │   ├── recipes.js        # Endpoints de recetas
│   │   └── cycles.js         # Endpoints de ciclos
│   ├── context/
│   │   ├── AuthContext.jsx   # Estado de autenticación
│   │   ├── DeviceContext.jsx # Estado de dispositivos
│   │   ├── TelemetryContext.jsx # Últimas lecturas
│   │   └── ThemeContext.jsx  # Tema claro/oscuro
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSSE.js         # Hook para Server-Sent Events
│   │   ├── useTelemetry.js
│   │   ├── useDevice.js
│   │   └── useMediaQuery.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Devices.jsx       # Lista de dispositivos
│   │   ├── DeviceDetail.jsx  # Detalle + control
│   │   ├── Recipes.jsx
│   │   ├── RecipeForm.jsx
│   │   ├── Cycles.jsx
│   │   ├── Alarms.jsx
│   │   ├── Analytics.jsx
│   │   ├── Settings.jsx
│   │   └── NotFound.jsx
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Spinner.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── FilterBar.jsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.jsx
│   │   │   ├── TelemetryChart.jsx
│   │   │   └── ActuatorStatus.jsx
│   │   ├── device/
│   │   │   ├── DeviceCard.jsx
│   │   │   ├── SensorReading.jsx
│   │   │   └── ActuatorControl.jsx
│   │   └── charts/
│   │       ├── LineChart.jsx
│   │       ├── GaugeChart.jsx
│   │       └── HistoryChart.jsx
│   ├── styles/
│   │   ├── variables.css     # Tokens de diseño
│   │   ├── global.css        # Reset + tipografía
│   │   └── *.module.css      # Estilos por componente
│   ├── utils/
│   │   ├── format.js         # Formateo de fechas, números
│   │   ├── constants.js      # Constantes de la app
│   │   └── validators.js     # Validación de formularios
│   └── assets/
│       └── images/
├── tests/
│   ├── components/
│   ├── pages/
│   └── setup.js
├── VERSION
├── package.json
├── vite.config.js
└── .env.local
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

    eventSource.addEventListener('telemetry', (e) => {
      setData(JSON.parse(e.data));
    });

    eventSource.addEventListener('actuator', (e) => {
      // Actualizar estado actuador en UI
    });

    eventSource.addEventListener('alarm', (e) => {
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
