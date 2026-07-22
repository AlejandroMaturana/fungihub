import { useState, useEffect } from 'react'
import { getDevices, getLatestTelemetry, getRecipes, getCycles } from '../../../api/client.js'
import LoadingState from '../../../shared/components/LoadingState.jsx'

const ENV_PARAMS = [
  { key: 'temperature', label: 'TEMPERATURE', unit: '°C', icon: 'thermostat', min: 18, max: 32 },
  { key: 'humidity', label: 'HUMIDITY', unit: '%', icon: 'water_drop', min: 60, max: 100 },
]

function CultivationSettings() {
  const [devices, setDevices] = useState([])
  const [telemetry, setTelemetry] = useState(null)
  const [recipes, setRecipes] = useState([])
  const [cycles, setCycles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadData() {
    try {
      const [devs, rec, cyc] = await Promise.all([getDevices().catch(() => []), getRecipes().catch(() => []), getCycles().catch(() => [])])
      setDevices(devs); setRecipes(rec); setCycles(cyc)
      if (devs[0]) { const tel = await getLatestTelemetry(devs[0].id).catch(() => null); setTelemetry(tel) }
      setError(null)
    } catch (err) { setError(err.message || 'Connection error') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [])

  if (loading) return <LoadingState message="Loading cultivation configuration..." icon="potted_plant" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="gradient-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Cultivation Configuration</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--outline)' }}>Environmental parameters, connection status, recipes and cycles</p>
      </div>

      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
          <span style={{ fontSize: '12px', color: 'var(--error-red)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Environment */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--spore-green)' }}>settings_input_composite</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Environment Parameters</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {ENV_PARAMS.map(param => {
              const value = telemetry ? telemetry[param.key] : null
              const pct = value != null ? ((value - param.min) / (param.max - param.min)) * 100 : 50
              const color = pct < 20 || pct > 80 ? 'var(--error-red)' : 'var(--spore-green)'
              return (
                <div key={param.key} style={{ padding: '16px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{param.label}</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color }}>{value != null ? value : '—'}</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(var(--surface-dim-rgb, 28, 27, 31), 0.6)', borderRadius: '9999px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '100%', width: `${pct}%`, borderRadius: '9999px', background: `linear-gradient(90deg, ${color}, ${color}aa)`, transition: 'width 0.5s' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)' }}>{param.min}{param.unit}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color }}>Optimal</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)' }}>{param.max}{param.unit}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recipes */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-purple, #a78bfa)' }}>restaurant_menu</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Recipes</span>
          </div>
          {recipes.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', padding: '32px 0' }}>No recipes defined</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}>
              {recipes.map(r => (
                <div key={r.id} style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-container)', borderLeft: '3px solid var(--spore-green)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--spore-green)' }}>{r.name || `Recipe #${r.id}`}</span>
                  {r.species && <span style={{ fontSize: '10px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>{r.species}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Cycles */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--spore-green)' }}>cyclone</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Active Cycles</span>
        </div>
        {cycles.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', padding: '24px 0' }}>No active cultivation cycles</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
            {cycles.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>{c.species || `Cycle #${c.id}`}</span>
                  <span style={{ fontSize: '10px', color: 'var(--outline)', display: 'block' }}>{c.status} — {c.currentPhase || '—'}</span>
                </div>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                  background: c.status === 'ACTIVE' ? 'rgba(var(--spore-green-rgb), 0.15)' : 'rgba(153, 153, 153, 0.1)',
                  color: c.status === 'ACTIVE' ? 'var(--spore-green)' : 'var(--outline)',
                }}>{c.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CultivationSettings
