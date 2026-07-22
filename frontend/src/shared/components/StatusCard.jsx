import StatusBadge from './StatusBadge'

function StatusCard({ status, title, subtitle, metric, metricUnit, onClick, actions }) {
  const classes = [
    'status-card',
    onClick && 'status-card-clickable'
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} onClick={onClick}>
      <div className="status-card-header">
        <StatusBadge status={status} label={title} />
        {actions && <div className="status-card-actions">{actions}</div>}
      </div>
      {subtitle && <p className="status-card-subtitle">{subtitle}</p>}
      {metric !== undefined && (
        <div className="status-card-metric">
          <span className="status-card-metric-value">{metric}</span>
          {metricUnit && <span className="status-card-metric-unit">{metricUnit}</span>}
        </div>
      )}
    </div>
  )
}

export default StatusCard
