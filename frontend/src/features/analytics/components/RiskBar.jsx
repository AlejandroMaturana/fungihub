function RiskBar({ label, value = 0, max = 100 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const color = pct > 75 ? 'var(--error)' : pct > 50 ? 'var(--amber)' : pct > 25 ? 'var(--teal)' : 'var(--spore-green)'

  return (
    <div className="flex items-center gap-3">
      <span className="text-8px text-on-surface-variant w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-8px font-mono text-on-surface w-8 text-right">{value}%</span>
    </div>
  )
}

export default RiskBar
