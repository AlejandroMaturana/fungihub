function getZoneColor(value, min, max) {
  const range = max - min
  const pct = (value - min) / range
  if (pct < 0.2 || pct > 0.8) return 'var(--error-red)'
  if (pct < 0.3 || pct > 0.7) return 'var(--amber)'
  return 'var(--spore-green)'
}

function DonutGauge({ value, min, max, unit, size }) {
  const r = size === 'sm' ? 14 : size === 'lg' ? 24 : 18
  const stroke = size === 'sm' ? 3 : size === 'lg' ? 5 : 4
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const color = getZoneColor(value, min, max)
  const view = (r + stroke) * 2

  return (
    <div className={`gauge-donut ${size || 'md'}`}>
      <svg width="100%" height="100%" viewBox={`0 0 ${view} ${view}`}>
        <circle cx={view / 2} cy={view / 2} r={r} fill="none" stroke="var(--surface-container)" strokeWidth={stroke} />
        <circle cx={view / 2} cy={view / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${circ * pct} ${circ * (1 - pct)}`}
          strokeLinecap="round" transform={`rotate(-90 ${view / 2} ${view / 2})`}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <div className="gauge-center">
        <span className="gauge-value">{value}</span>
        {unit && <span className="gauge-unit">{unit}</span>}
      </div>
    </div>
  )
}

function HalfGauge({ value, min, max, unit, label, size }) {
  const w = size === 'sm' ? 120 : size === 'lg' ? 200 : 160
  const h = size === 'sm' ? 60 : size === 'lg' ? 100 : 80
  const r = size === 'sm' ? 40 : size === 'lg' ? 70 : 55
  const stroke = size === 'sm' ? 10 : size === 'lg' ? 16 : 13
  const color = getZoneColor(value, min, max)
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const da = Math.PI
  const offset = da * (1 - pct)
  const totalLength = da * r

  function arcPath(startAngle, endAngle, radius) {
    const x1 = (w / 2) + radius * Math.cos(startAngle)
    const y1 = h + radius * Math.sin(startAngle)
    const x2 = (w / 2) + radius * Math.cos(endAngle)
    const y2 = h + radius * Math.sin(endAngle)
    const large = endAngle - startAngle > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 0 ${x2} ${y2}`
  }

  const startAngle = Math.PI
  const endAngle = 0
  const valueAngle = Math.PI * (1 - pct)

  return (
    <div className={`gauge-half ${size || 'md'}`}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <path d={arcPath(startAngle, endAngle, r)} fill="none" stroke="var(--surface-container)" strokeWidth={stroke} />
        <path d={arcPath(startAngle, valueAngle, r)} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
        <text x={w / 2} y={h - 8} textAnchor="middle" fill={color}
          fontFamily="var(--font-mono)" fontSize={size === 'sm' ? 11 : size === 'lg' ? 18 : 14} fontWeight="600">
          {value}{unit}
        </text>
      </svg>
      {label && <span className="gauge-half-label">{label}</span>}
    </div>
  )
}

function Gauge({ variant, value, min = 0, max = 100, unit, label, size = 'md' }) {
  if (variant === 'half') {
    return <HalfGauge value={value} min={min} max={max} unit={unit} label={label} size={size} />
  }
  return <DonutGauge value={value} min={min} max={max} unit={unit} size={size} />
}

export default Gauge
