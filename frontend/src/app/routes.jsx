import { lazy } from 'react'

const Landing = lazy(() => import('../features/auth/pages/LandingPage.jsx'))
const Home = lazy(() => import('../features/auth/pages/HomeRedirect.jsx'))
const Dashboard = lazy(() => import('../features/dashboard/pages/DashboardPage.jsx'))
const DeviceDetail = lazy(() => import('../features/devices/pages/DeviceDetailPage.jsx'))
const Recipes = lazy(() => import('../features/cultivation/pages/RecipesPage.jsx'))
const RecipeComparator = lazy(() => import('../features/cultivation/pages/RecipeComparatorPage.jsx'))
const SpeciesLibrary = lazy(() => import('../features/cultivation/pages/SpeciesLibraryPage.jsx'))
const Cycles = lazy(() => import('../features/cultivation/pages/CyclesPage.jsx'))
const BioactiveDashboard = lazy(() => import('../features/cultivation/pages/BioactiveDashboardPage.jsx'))
const Alarms = lazy(() => import('../features/alarms/pages/AlarmsPage.jsx'))
const Logs = lazy(() => import('../features/logs/pages/LogsPage.jsx'))
const Diagnostics = lazy(() => import('../features/diagnostics/pages/DiagnosticsPage.jsx'))
const Analytics = lazy(() => import('../features/analytics/pages/AnalyticsPage.jsx'))
const Settings = lazy(() => import('../features/settings/pages/SettingsPage.jsx'))
const SettingsHub = lazy(() => import('../features/settings/pages/SettingsHub.jsx'))
const UserSettings = lazy(() => import('../features/settings/pages/UserSettings.jsx'))
const DeviceSettings = lazy(() => import('../features/settings/pages/DeviceSettings.jsx'))
const CultivationSettings = lazy(() => import('../features/settings/pages/CultivationSettings.jsx'))
const ApiKeysSettings = lazy(() => import('../features/settings/pages/ApiKeysSettings.jsx'))
const SystemSettings = lazy(() => import('../features/settings/pages/SystemSettings.jsx'))
const SubscriptionSettings = lazy(() => import('../features/settings/pages/SubscriptionSettings.jsx'))
const Provisioning = lazy(() => import('../features/devices/pages/ProvisioningPage.jsx'))

export const publicRoutes = [
  { path: '*', element: Landing },
]

export const protectedRoutes = [
  { path: '/', element: Home },
  { path: '/dashboard', element: Dashboard },
  { path: '/devices/:id', element: DeviceDetail },
  { path: '/recipes', element: Recipes },
  { path: '/recipes/compare', element: RecipeComparator },
  { path: '/species', element: SpeciesLibrary },
  { path: '/cycles', element: Cycles },
  { path: '/cycles/:id/bioactives', element: BioactiveDashboard },
  { path: '/alarms', element: Alarms },
  { path: '/logs', element: Logs },
  { path: '/diagnostics', element: Diagnostics },
  { path: '/analytics', element: Analytics },
  {
    path: '/settings',
    element: Settings,
    children: [
      { index: true, element: SettingsHub },
      { path: 'user', element: UserSettings },
      { path: 'device', element: DeviceSettings },
      { path: 'cultivation', element: CultivationSettings },
      { path: 'api-keys', element: ApiKeysSettings },
      { path: 'system', element: SystemSettings },
      { path: 'subscription', element: SubscriptionSettings },
    ],
  },
  { path: '/provisioning', element: Provisioning },
]
