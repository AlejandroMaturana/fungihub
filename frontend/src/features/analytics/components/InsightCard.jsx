function InsightCard({ title, value, unit, icon, trend, color = 'var(--spore-green)' }) {
  const trendIcon = trend > 0 ? 'trending_up' : trend < 0 ? 'trending_down' : 'trending_flat'
  const trendColor = trend > 0 ? 'text-green-400' : trend < 0 ? 'text-error' : 'text-on-surface-variant'

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="material-symbols-outlined text-18px" style={{ color }}>{icon}</span>
        {trend != null && (
          <span className={`flex items-center gap-0.5 text-8px ${trendColor}`}>
            <span className="material-symbols-outlined text-10px">{trendIcon}</span>
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-data-xl text-on-surface font-mono">{value ?? '--'}<span className="text-data-sm text-on-surface-variant ml-0.5">{unit}</span></div>
      <div className="text-8px text-on-surface-variant mt-1">{title}</div>
    </div>
  )
}

export default InsightCard
