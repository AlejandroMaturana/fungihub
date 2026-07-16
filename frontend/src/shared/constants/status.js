export const STATUS_LABELS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
  ERROR: 'Error',
}

export const SEVERITY_LABELS = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
}

export const SEVERITY_COLORS = {
  CRITICAL: 'text-error',
  HIGH: 'text-warning',
  MEDIUM: 'text-info',
  LOW: 'text-on-surface-variant',
}

export const PHASE_LABELS = {
  INCUBATION: 'Incubation',
  FRUITING: 'Fruiting',
  MAINTENANCE: 'Maintenance',
  COMPLETED: 'Completed',
}

export const CYCLE_STATUS_LABELS = {
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  ABORTED: 'Aborted',
}

export const DIFFICULTY_LABELS = {
  BEGINNER: { label: 'Principiante', color: 'text-green-500', icon: 'signal_1' },
  INTERMEDIATE: { label: 'Intermedio', color: 'text-amber-500', icon: 'signal_2' },
  ADVANCED: { label: 'Avanzado', color: 'text-red-500', icon: 'signal_3' },
}

export const ADAPTER_CLASS_LABELS = {
  ADAPTOGEN: { label: 'Adaptógeno', color: 'text-purple-400' },
  EDIBLE: { label: 'Comestible', color: 'text-green-400' },
  MEDICINAL: { label: 'Medicinal', color: 'text-blue-400' },
}

export const ROLE_LABELS = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'text-purple-400' },
  ADMIN: { label: 'Admin', color: 'text-blue-400' },
  OPERATOR: { label: 'Operator', color: 'text-green-400' },
  VIEWER: { label: 'Viewer', color: 'text-gray-400' },
}
