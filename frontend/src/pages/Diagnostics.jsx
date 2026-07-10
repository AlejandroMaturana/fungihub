import { useState, useEffect } from 'react'
import { getMqttDiagnostics, publishMqttTest } from '../api/client.js'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'

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
  if (error) return <ErrorState message={error} onRetry={fetchDiag} />

  const { mqtt, ssrChannels, chamberControlMode } = data || {}

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface mb-1">Diagnostics</h1>
        <p className="text-on-surface-variant text-body-md">MQTT connection status and system diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <section className="glass-card p-5 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">podcast</span>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">MQTT BROKER STATUS</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <span className="font-label-caps text-9px text-on-surface-variant">PRIMARY</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mqtt?.primaryConnected ? 'bg-primary breathing-pulse' : 'bg-error'}`} />
                <span className="text-data-sm text-on-surface">{mqtt?.primaryConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <span className="font-label-caps text-9px text-on-surface-variant">FALLBACK</span>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mqtt?.fallbackConnected ? 'bg-primary breathing-pulse' : mqtt?.fallbackConnected === false ? 'bg-error' : 'bg-outline-variant'}`} />
                <span className="text-data-sm text-on-surface">{mqtt?.fallbackConnected ? 'Connected' : mqtt?.fallbackConnected === false ? 'Disconnected' : 'Not configured'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <span className="font-label-caps text-9px text-on-surface-variant">ACTIVE BROKER</span>
              <span className="text-data-sm text-on-surface font-mono">{mqtt?.active || '—'}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded">
              <span className="font-label-caps text-9px text-on-surface-variant">CONNECTED DEVICES</span>
              <span className="text-headline-sm text-primary">{mqtt?.connectedDevices ?? '—'}</span>
            </div>
          </div>
        </section>

        <section className="glass-card p-5 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">sensors</span>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">CHAMBER CONTROL MODE</h3>
          </div>
          {chamberControlMode && Object.keys(chamberControlMode).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(chamberControlMode).map(([deviceId, mode]) => (
                <div key={deviceId} className="flex items-center justify-between p-3 bg-surface-container-low rounded">
                  <span className="font-mono text-data-sm text-on-surface">{deviceId}</span>
                  <span className={`font-label-caps text-10px px-2 py-0.5 rounded ${mode === 'AUTO' ? 'bg-primary/20 text-primary' : 'bg-tertiary/20 text-tertiary'}`}>
                    {mode}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-body-sm text-on-surface-variant py-4 text-center">No devices registered</p>
          )}
        </section>
      </div>

      <section className="glass-card p-5 rounded-xl border border-outline-variant mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-secondary">ssr</span>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant">SSR CHANNELS</h3>
        </div>
        {ssrChannels && ssrChannels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr className="border-b border-outline-variant text-label-caps text-9px text-on-surface-variant">
                  <th className="p-2 font-weight-normal">Device</th>
                  <th className="p-2 font-weight-normal">Channel</th>
                  <th className="p-2 font-weight-normal">State</th>
                  <th className="p-2 font-weight-normal">Mode</th>
                </tr>
              </thead>
              <tbody>
                {ssrChannels.map((ch, i) => (
                  <tr key={i} className="border-b border-outline-variant">
                    <td className="p-2 text-data-sm text-on-surface font-mono">{ch.deviceId}</td>
                    <td className="p-2 text-data-sm text-on-surface">{ch.channel}</td>
                    <td className="p-2">
                      <span className={`text-data-sm ${ch.state === 'ON' || ch.state === 1 ? 'text-primary' : 'text-on-surface-variant'}`}>
                        {ch.state ?? '—'}
                      </span>
                    </td>
                    <td className="p-2 text-data-sm text-on-surface-variant">{ch.mode || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant py-4 text-center">No SSR channels</p>
        )}
      </section>

      <section className="glass-card p-5 rounded-xl border border-outline-variant">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-secondary">publish</span>
          <h3 className="font-label-caps text-label-caps text-on-surface-variant">MQTT PUBLISH TEST</h3>
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <p className="font-label-caps text-9px text-on-surface-variant mb-1">DEVICE</p>
            <select className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-md text-on-surface cursor-pointer" value={selectedDevice} onChange={e => setSelectedDevice(e.target.value)}>
              {(ssrChannels?.length > 0
                ? [...new Set(ssrChannels.map(ch => ch.deviceId))]
                : chamberControlMode ? Object.keys(chamberControlMode) : []
              ).map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handlePublish} disabled={publishing || !selectedDevice}>
            {publishing ? 'PUBLISHING...' : 'PUBLISH TEST'}
          </button>
        </div>
        {pubMsg && (
          <p className={`mt-3 text-body-sm ${pubMsg.type === 'ok' ? 'text-primary' : pubMsg.type === 'warn' ? 'text-tertiary' : 'text-error'}`}>
            {pubMsg.text}
          </p>
        )}
      </section>
    </div>
  )
}

export default Diagnostics
