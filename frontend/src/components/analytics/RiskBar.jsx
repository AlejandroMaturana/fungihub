function RiskBar({ label, value, icon }) {
  const getColor = (v) => {
    if (v <= 25) return { bar: 'var(--spore-green)', text: 'var(--spore-green)', label: 'Low' }
    if (v <= 50) return { bar: 'var(--accent-blue, #60a5fa)', text: 'var(--accent-blue, #60a5fa)', label: 'Moderate' }
    if (v <= 75) return { bar: 'var(--amber)', text: 'var(--amber)', label: 'High' }
    return { bar: 'var(--error-red)', text: 'var(--error-red)', label: 'Critical' }
  }
  const c = getColor(value)
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--outline)' }}>{icon}</span>}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: c.text }}>{c.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--on-surface-variant)' }}>{value}%</span>
        </div>
      </div>
      <div style={{ height: '8px', background: 'rgba(var(--surface-dim-rgb, 28, 27, 31), 0.6)', borderRadius: '9999px', overflow: 'hidden', border: '1px solid var(--outline-variant)' }}>
        <div
          style={{
            height: '100%', width: `${pct}%`, borderRadius: '9999px',
            background: `linear-gradient(90deg, ${c.bar}, ${c.bar}aa)`,
            transition: 'width 0.5s ease',
            boxShadow: pct > 50 ? `0 0 8px ${c.bar}40` : 'none',
          }}
        />
      </div>
    </div>
  )
}

export default RiskBar
