import { useState, useEffect, useCallback } from 'react'
import { getDevices, getChamberAnalytics } from '../api/client.js'
import { useSSE } from '../api/useSSE.js'
import RiskBar from '../components/analytics/RiskBar.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'

const METRIC_CONFIG = {
  temperature: { label: 'TEMPERATURE', icon: 'thermostat', color: 'var(--spore-green)' },
  humidity: { label: 'HUMIDITY', icon: 'water_drop', color: 'var(--accent-blue, #60a5fa)' },
  co2: { label: 'CO₂', icon: 'co2', color: 'var(--accent-purple, #a78bfa)' },
}

function Analytics() {
  const [devices, setDevices] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadDevices() {
    try {
      const devs = await getDevices()
      setDevices(devs)
      if (!selectedId && devs[0]) setSelectedId(devs[0].id)
      setError(null)
    } catch (err) {
      setError(err.message || 'Error loading devices')
    } finally {
      setLoading(false)
    }
  }

  async function loadAnalytics(id) {
    if (!id) return
    try {
      const result = await getChamberAnalytics(id)
      setAnalytics(result.data)
      setError(null)
    } catch (err) {
      setError(err.message || 'Error loading analytics')
    }
  }

  useEffect(() => { loadDevices() }, [])
  useEffect(() => { loadAnalytics(selectedId) }, [selectedId])

  useSSE(useCallback((type) => {
    if (type === 'telemetry' || type === 'state') {
      loadAnalytics(selectedId)
    }
  }, [selectedId]))

  if (loading) return <LoadingState message="Loading analytics..." icon="analytics" />

  const { telemetry, vpd, risks, cycle, chamber, efficiency } = analytics || {}
  const vpdColor = vpd?.vpd > 1.5 ? 'var(--error-red)' : 'var(--spore-green)'
  const hasHighRisk = risks && (risks.condensation > 50 || risks.heatStress > 50 || risks.waterStress > 50)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Chamber Analytics</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--outline)' }}>
            VPD, biological risks and live metrics
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {chamber && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: chamber.status === 'ONLINE' ? 'var(--spore-green)' : 'var(--outline)', boxShadow: chamber.status === 'ONLINE' ? '0 0 8px var(--spore-green)' : 'none' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: chamber.status === 'ONLINE' ? 'var(--spore-green)' : 'var(--outline)' }}>
                {chamber.status || '—'}
              </span>
            </div>
          )}
          {devices.length > 1 && (
            <select
              value={selectedId || ''}
              onChange={e => setSelectedId(e.target.value)}
              className="form-select"
              style={{ fontSize: '11px', minWidth: '180px' }}
            >
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.chamberName || d.deviceId}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
          <span style={{ fontSize: '12px', color: 'var(--error-red)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {analytics ? (
        <>
          {/* Live Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {/* Temp, Humidity, CO2 */}
            {Object.entries(METRIC_CONFIG).map(([key, cfg]) => {
              const t = telemetry?.[key]
              return (
                <div key={key} className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: cfg.color }}>{cfg.icon}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cfg.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '28px', fontWeight: 700, color: cfg.color, lineHeight: 1 }}>
                      {t?.value != null ? t.value : '—'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--outline)' }}>{t?.unit || ''}</span>
                  </div>
                </div>
              )
            })}

            {/* VPD */}
            <div className="glass-card" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: vpdColor }}>air</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>VPD</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <span style={{ fontSize: '28px', fontWeight: 700, color: vpdColor, lineHeight: 1 }}>
                  {vpd?.vpd ?? '—'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--outline)' }}>{vpd?.unit || ''}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Left Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Biological Risks */}
              {risks && (
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Biological Risks</span>
                  </div>
                  <RiskBar label="Condensation / Botrytis" value={risks.condensation || 0} icon="water_drop" />
                  <RiskBar label="Heat Stress" value={risks.heatStress || 0} icon="thermostat" />
                  <RiskBar label="Water Stress" value={risks.waterStress || 0} icon="humidity_high" />
                </div>
              )}

              {/* Environmental Insights */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-blue, #60a5fa)' }}>insights</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Environmental Insights</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Saturation Deficit</span>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)' }}>{vpd?.saturationDeficit ?? '—'}</span>
                    <span style={{ fontSize: '10px', color: 'var(--outline)', display: 'block' }}>{vpd?.unit}</span>
                  </div>
                  <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Efficiency</span>
                    <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)' }}>{efficiency?.totalDevices ?? '—'}</span>
                    <span style={{ fontSize: '10px', color: 'var(--outline)', display: 'block' }}>devices · FAE: {efficiency?.faeEnabled ? 'ON' : 'OFF'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Active Cycle */}
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--spore-green)' }}>cyclone</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Active Cycle</span>
                </div>
                {cycle ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      { label: 'Species', value: cycle.species || '—' },
                      { label: 'Status', value: cycle.status, color: 'var(--spore-green)' },
                      { label: 'Phase', value: cycle.currentPhase || '—' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{item.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: item.color || 'var(--on-surface)' }}>{item.value}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Days Elapsed</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--spore-green)' }}>{cycle.daysElapsed ?? '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', padding: '24px 0' }}>No active cycle</p>
                )}
              </div>

              {/* Alert */}
              {hasHighRisk && (
                <div style={{
                  padding: '16px', borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className="material-symbols-outlined pulse-error" style={{ fontSize: '18px', color: 'var(--error-red)' }}>priority_high</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: 'var(--error-red)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Alert</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--on-surface)', lineHeight: 1.6 }}>
                    {risks.condensation > 75 && 'High condensation risk — check ventilation. '}
                    {risks.heatStress > 75 && 'Critical heat stress — reduce temperature. '}
                    {risks.waterStress > 75 && 'Severe water stress — increase humidity. '}
                    {risks.condensation <= 75 && risks.heatStress <= 75 && risks.waterStress <= 75 && 'Elevated risk levels — monitor closely.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '16px', display: 'block' }}>analytics</span>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>No Chamber Selected</h3>
          <p style={{ fontSize: '13px', color: 'var(--outline)' }}>Select a chamber to view analytics.</p>
        </div>
      )}
    </div>
  )
}

export default Analytics
