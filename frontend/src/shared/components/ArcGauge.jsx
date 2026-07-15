function ArcGauge({ value, min = 0, max = 100, unit = '%', color = 'primary', size = 'md', label, trend, errorState, errorMessage }) {
  const cx = 50, cy = 45, r = 35
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)))
  const angle = normalized * 180
  const radians = (angle - 180) * (Math.PI / 180)
  const endX = cx + r * Math.cos(radians)
  const endY = cy + r * Math.sin(radians)
  const largeArc = angle > 90 ? 1 : 0
  const dashLen = r * Math.PI
  const offset = dashLen * (1 - normalized)

  const colorMap = { primary: 'stroke-primary', secondary: 'stroke-secondary', tertiary: 'stroke-tertiary', error: 'stroke-error' }
  const textMap = { primary: 'text-primary', secondary: 'text-secondary', tertiary: 'text-tertiary', error: 'text-error' }
  const trackClass = 'stroke-surface-variant'
  const valueClass = colorMap[color] || 'stroke-primary'

  return (
    <div className={`flex flex-col items-center ${size === 'sm' ? 'w-28' : 'w-full max-w-[160px]'}`}>
      <div className="relative w-full aspect-[2/1] mb-1">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 50">
          <path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" className={trackClass} strokeLinecap="round" strokeWidth="6" />
          {!errorState && (
            <path d="M 10 45 A 35 35 0 0 1 90 45" fill="none" className={valueClass} strokeLinecap="round" strokeWidth="6"
              strokeDasharray={dashLen} strokeDashoffset={offset} style={{ filter: `drop-shadow(0 0 4px currentColor)` }} />
          )}
          <line stroke="#dfe4e0" strokeLinecap="round" strokeWidth="2" x1="50" y1="45" x2={endX} y2={endY} opacity={errorState ? 0.5 : 1} />
          <circle cx="50" cy="45" fill="#dfe4e0" r="3" />
        </svg>
        {errorState && (
          <span className="material-symbols-outlined text-error text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">report</span>
        )}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-headline-lg ${errorState ? 'text-error/80' : 'text-on-surface'}`}>
          {errorState ? '--' : value}
        </span>
        {unit && <span className="text-data-sm text-on-surface-variant">{unit}</span>}
      </div>
      {trend && (
        <div className="h-8 w-full opacity-40 mt-1">
          <svg className="w-full h-full" viewBox="0 0 100 20">
            <polyline fill="none" className={valueClass} points={trend} strokeWidth="1" />
          </svg>
        </div>
      )}
      {label && <span className="font-label-caps text-9px text-on-surface-variant mt-1">{label}</span>}
      {errorMessage && <span className="font-label-caps text-9px text-error text-center mt-1 uppercase tracking-widest">{errorMessage}</span>}
    </div>
  )
}

export default ArcGauge
