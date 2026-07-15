import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/settings', icon: 'tune', label: 'General', end: true },
  { to: '/settings/user', icon: 'person', label: 'User' },
  { to: '/settings/device', icon: 'devices', label: 'Devices' },
  { to: '/settings/cultivation', icon: 'potted_plant', label: 'Cultivation' },
  { to: '/settings/api-keys', icon: 'key', label: 'API Keys' },
  { to: '/settings/system', icon: 'terminal', label: 'System' },
  { to: '/settings/subscription', icon: 'credit_card', label: 'Subscription' },
]

function SettingsNav() {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-2 px-3 py-2 rounded-lg text-body-sm transition-all ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`
          }
        >
          <span className="material-symbols-outlined text-18px">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default SettingsNav
