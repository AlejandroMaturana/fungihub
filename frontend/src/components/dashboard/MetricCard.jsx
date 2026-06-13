function MetricCard({ label, value, unit, ts }) {
  const time = ts ? new Date(ts).toLocaleTimeString() : null
  return (
    <div className="metric-card">
      <div className="label">{label}</div>
      <div className="value">{typeof value === 'number' ? value.toFixed(1) : value}</div>
      <div className="unit">{unit}</div>
      {time && <div className="ts">{time}</div>}
    </div>
  )
}

export default MetricCard
