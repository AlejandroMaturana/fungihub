import { useInterval } from '../../../shared/hooks/useInterval'
import { useState } from 'react'

function LiveMetric({ label, fetchFn, unit = '', icon = 'monitoring', color = 'var(--spore-green)' }) {
  const [value, setValue] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  useInterval(async () => {
    try {
      const data = await fetchFn()
      setValue(data)
      setLastUpdate(new Date())
    } catch {}
  }, 5000)

  return (
    <div className="glass-card rounded-lg p-3 flex items-center gap-3">
      <span className="material-symbols-outlined text-20px" style={{ color }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-8px font-label-caps text-on-surface-variant">{label}</div>
        <div className="text-data-lg text-on-surface font-mono">
          {value != null ? `${value}${unit}` : '--'}
        </div>
      </div>
      {lastUpdate && (
        <span className="text-8px text-on-surface-variant">
          {lastUpdate.toLocaleTimeString('en-GB', { hour12: false, minute: '2-digit', second: '2-digit' })}
        </span>
      )}
    </div>
  )
}

export default LiveMetric
