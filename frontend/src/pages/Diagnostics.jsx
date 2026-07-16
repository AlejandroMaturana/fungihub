import { useState, useEffect } from 'react'
import { getMqttDiagnostics, publishMqttTest } from '../api/client.js'
import LoadingState from '../components/ui/LoadingState.jsx'

const BROKER_FIELDS = [
  { key: 'primary', label: 'PRIMARY', statusKey: 'primaryConnected' },
  { key: 'fallback', label: 'FALLBACK', statusKey: 'fallbackConnected' },
]

function Diagnostics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [pubMsg, setPubMsg] = useState(null)
  const [selectedDevice, setSelectedDevice] = useState('')

  async function fetchDiag() {
    try {
      const d = await getMqttDiagnostics()
      setData(d)
      if (d.ssrChannels?.length > 0 && !selectedDevice) {
        setSelectedDevice(d.ssrChannels[0].deviceId)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Error loading diagnostics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDiag() }, [])

  async function handlePublish() {
    if (!selectedDevice) return
    setPublishing(true)
    setPubMsg(null)
    try {
      const result = await publishMqttTest(selectedDevice)
      setPubMsg({ type: result.data.published ? 'ok' : 'warn', text: result.message })
    } catch (err) {
      setPubMsg({ type: 'err', text: err.response?.data?.error || err.message })
    } finally {
      setPublishing(false)
    }
  }

  if (loading) return <LoadingState message="Loading diagnostics..." icon="diagnosis" />

  const { mqtt, ssrChannels, chamberControlMode } = data || {}
  const uniqueDevices = ssrChannels?.length > 0
    ? [...new Set(ssrChannels.map(ch => ch.deviceId))]
    : chamberControlMode ? Object.keys(chamberControlMode) : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="gradient-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Diagnostics</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--outline)' }}>
          MQTT connection status and system diagnostics
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
          <span style={{ fontSize: '12px', color: 'var(--error-red)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* Top Row: MQTT + Control Mode */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* MQTT Broker Status */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-blue, #60a5fa)' }}>podcast</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>MQTT Broker Status</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {BROKER_FIELDS.map(({ key, label, statusKey }) => {
              const connected = mqtt?.[statusKey]
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: connected ? 'var(--spore-green)' : (connected === false ? 'var(--error-red)' : 'var(--outline)'),
                      boxShadow: connected ? '0 0 8px var(--spore-green)' : 'none',
                    }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: connected ? 'var(--spore-green)' : (connected === false ? 'var(--error-red)' : 'var(--outline)') }}>
                      {connected ? 'Connected' : (connected === false ? 'Disconnected' : 'Not configured')}
                    </span>
                  </div>
                </div>
              )
            })}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Active Broker</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--on-surface)' }}>{mqtt?.active || '—'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Connected Devices</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--spore-green)' }}>{mqtt?.connectedDevices ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Chamber Control Mode */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-blue, #60a5fa)' }}>sensors</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Chamber Control Mode</span>
          </div>
          {chamberControlMode && Object.keys(chamberControlMode).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(chamberControlMode).map(([deviceId, mode]) => (
                <div key={deviceId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface)' }}>{deviceId}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                    background: mode === 'AUTO' ? 'rgba(var(--spore-green-rgb), 0.15)' : 'rgba(167, 139, 250, 0.15)',
                    color: mode === 'AUTO' ? 'var(--spore-green)' : 'var(--accent-purple, #a78bfa)',
                    border: `1px solid ${mode === 'AUTO' ? 'rgba(var(--spore-green-rgb), 0.3)' : 'rgba(167, 139, 250, 0.3)'}`,
                  }}>
                    {mode}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', padding: '32px 0' }}>No devices registered</p>
          )}
        </div>
      </div>

      {/* SSR Channels */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-blue, #60a5fa)' }}>ssr</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>SSR Channels</span>
        </div>
        {ssrChannels && ssrChannels.length > 0 ? (
          <div style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Channel</th>
                  <th>State</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {ssrChannels.map((ch, i) => (
                  <tr key={i}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface)' }}>{ch.deviceId}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--on-surface)' }}>{ch.channel}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: (ch.state === 'ON' || ch.state === 1) ? 'var(--spore-green)' : 'var(--outline)',
                        }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: (ch.state === 'ON' || ch.state === 1) ? 'var(--spore-green)' : 'var(--on-surface-variant)' }}>
                          {ch.state ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--on-surface-variant)' }}>{ch.mode || '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', padding: '24px 0' }}>No SSR channels</p>
        )}
      </div>

      {/* MQTT Publish Test */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--accent-blue, #60a5fa)' }}>publish</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>MQTT Publish Test</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Device</label>
            <select className="form-select" style={{ fontSize: '11px' }} value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}>
              {uniqueDevices.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-glow"
            style={{ fontSize: '10px', whiteSpace: 'nowrap' }}
            onClick={handlePublish}
            disabled={publishing || !selectedDevice}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>send</span>
            {publishing ? 'PUBLISHING...' : 'PUBLISH TEST'}
          </button>
        </div>
        {pubMsg && (
          <div style={{
            marginTop: '12px', padding: '10px 14px', borderRadius: '8px',
            background: pubMsg.type === 'ok' ? 'rgba(var(--spore-green-rgb), 0.08)' : pubMsg.type === 'warn' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${pubMsg.type === 'ok' ? 'rgba(var(--spore-green-rgb), 0.2)' : pubMsg.type === 'warn' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
          }}>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: pubMsg.type === 'ok' ? 'var(--spore-green)' : pubMsg.type === 'warn' ? 'var(--amber)' : 'var(--error-red)',
            }}>
              {pubMsg.text}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Diagnostics
