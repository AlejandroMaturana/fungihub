import { NavLink } from 'react-router-dom'

const SECTIONS = [
  { to: '/system/settings', icon: 'hub', label: 'Overview', end: true },
  { to: '/system/settings/user', icon: 'fingerprint', label: 'User' },
  { to: '/system/settings/device', icon: 'developer_board', label: 'Device' },
  { to: '/system/settings/cultivation', icon: 'potted_plant', label: 'Cultivation' },
  { to: '/system/settings/api-keys', icon: 'vpn_key', label: 'API Keys' },
  { to: '/system/settings/subscription', icon: 'workspace_premium', label: 'Subscription' },
  { to: '/system/settings/system', icon: 'settings', label: 'System' },
]

function SettingsNav() {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      {SECTIONS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          end={!!item.end}
          style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '8px',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
            textDecoration: 'none', transition: 'all 0.2s',
            background: isActive ? 'rgba(var(--spore-green-rgb), 0.1)' : 'transparent',
            color: isActive ? 'var(--spore-green)' : 'var(--on-surface-variant)',
            borderLeft: isActive ? '2px solid var(--spore-green)' : '2px solid transparent',
          })}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

export default SettingsNav
