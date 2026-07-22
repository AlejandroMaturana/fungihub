function MetricCard({ icon, label, value, unit, trend, className, children }) {
  const classes = ['metric-card', className].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {(icon || label) && (
        <div className="metric-card-header">
          {icon && <span className="material-symbols-outlined metric-card-icon">{icon}</span>}
          <span className="metric-card-label">{label}</span>
        </div>
      )}
      <div className="metric-card-value-row">
        <span className="metric-card-value">{value}</span>
        {unit && <span className="metric-card-unit">{unit}</span>}
        {trend && (
          <span className={`metric-card-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export default MetricCard
