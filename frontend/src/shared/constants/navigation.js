export const NAV_SECTIONS = [
  {
    label: 'MONITOREO',
    items: [
      { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
      { to: '/provisioning', icon: 'bluetooth', label: 'Provision' },
    ],
  },
  {
    label: 'CULTIVO',
    items: [
      { to: '/recipes', icon: 'potted_plant', label: 'Recipes' },
      { to: '/species', icon: 'biotech', label: 'Species' },
      { to: '/cycles', icon: 'cyclone', label: 'Cycles' },
    ],
  },
  {
    label: 'OPERACIÓN',
    items: [
      { to: '/analytics', icon: 'analytics', label: 'Analytics' },
      { to: '/alarms', icon: 'warning', label: 'Alarms', hasBadge: true },
      { to: '/logs', icon: 'history', label: 'Logs' },
      { to: '/diagnostics', icon: 'diagnosis', label: 'Diag' },
    ],
  },
  {
    label: 'SISTEMA',
    items: [
      { to: '/settings', icon: 'settings', label: 'Settings' },
    ],
  },
]
