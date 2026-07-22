import StatusBadge from './StatusBadge'

function EntityHeader({ title, subtitle, badge, badgeVariant = 'online', actions, children }) {
  return (
    <div className="entity-header">
      <div className="entity-header-content">
        <div className="entity-header-text">
          <h1 className="entity-header-title">{title}</h1>
          {subtitle && <p className="entity-header-subtitle">{subtitle}</p>}
        </div>
        <div className="entity-header-actions">
          {badge && <StatusBadge status={badgeVariant} label={badge} />}
          {actions}
        </div>
      </div>
      {children}
    </div>
  )
}

export default EntityHeader
