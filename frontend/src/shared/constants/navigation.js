export const NAV_SECTIONS = [
  {
    id: 'overview',
    label: 'OVERVIEW',
    standalone: true,
    items: [
      { to: '/overview', icon: 'dashboard', label: 'Dashboard' },
    ],
  },
  {
    id: 'fleet',
    label: 'FLEET',
    icon: 'devices',
    collapsible: true,
    items: [
      { to: '/fleet/devices', icon: 'devices', label: 'Devices' },
      { to: '/fleet/provision', icon: 'bluetooth', label: 'Provisioning' },
    ],
  },
  {
    id: 'cultivation',
    label: 'CULTIVATION',
    icon: 'potted_plant',
    collapsible: true,
    items: [
      { to: '/cultivation/recipes', icon: 'science', label: 'Recipes' },
      { to: '/cultivation/species', icon: 'biotech', label: 'Species' },
      { to: '/cultivation/cycles', icon: 'cyclone', label: 'Cycles' },
    ],
  },
  {
    id: 'operations',
    label: 'OPERATIONS',
    icon: 'monitoring',
    collapsible: true,
    items: [
      { to: '/operations/analytics', icon: 'analytics', label: 'Analytics' },
      { to: '/operations/alarms', icon: 'warning', label: 'Alarms', hasBadge: true },
      { to: '/operations/events', icon: 'bolt', label: 'Events' },
      { to: '/operations/logs', icon: 'history', label: 'Audit Log' },
      { to: '/operations/diagnostics', icon: 'diagnosis', label: 'Diagnostics' },
    ],
  },
  {
    id: 'system',
    label: 'SYSTEM',
    icon: 'settings',
    collapsible: true,
    items: [
      { to: '/system/settings', icon: 'tune', label: 'Settings' },
    ],
  },
]
