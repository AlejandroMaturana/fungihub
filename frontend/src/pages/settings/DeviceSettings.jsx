import { useState, useEffect } from 'react'
import { getDevices, updateDevice, getLatestTelemetry, getActuators } from '../../api/client.js'
import LoadingState from '../../components/ui/LoadingState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'

const SENSOR_TYPES = [
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'thermostat' },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: 'water_drop' },
  { key: 'co2', label: 'CO2', unit: 'ppm', icon: 'co2' },
  { key: 'voc', label: 'VOC', unit: 'ppb', icon: 'air' },
]

function DeviceSettings() {
  const [devices, setDevices] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [device, setDevice] = useState(null)
  const [telemetry, setTelemetry] = useState(null)
  const [actuators, setActuators] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameMsg, setRenameMsg] = useState(null)
  const [firmwareCmd, setFirmwareCmd] = useState('')
  const [firmwareLog, setFirmwareLog] = useState([])

  async function loadData() {
    try {
      const devs = await getDevices()
      setDevices(devs)
      const targetId = selectedId || devs[0]?.id
      if (targetId) {
        setSelectedId(targetId)
        const dev = devs.find(d => d.id === Number(targetId)) || devs[0]
        setDevice(dev)
        setRenameValue(dev.chamberName || dev.deviceId || '')
        const [tel, acts] = await Promise.all([
          getLatestTelemetry(dev.id).catch(() => null),
          getActuators(dev.id).catch(() => []),
        ])
        setTelemetry(tel)
        setActuators(acts)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  async function handleRename() {
    if (!device || !renameValue.trim()) return
    setSaving(true)
    setRenameMsg(null)
    try {
      await updateDevice(device.id, { chamberName: renameValue.trim() })
      setDevice(prev => ({ ...prev, chamberName: renameValue.trim() }))
      setRenameMsg({ type: 'ok', text: 'Device name updated' })
    } catch (err) {
      setRenameMsg({ type: 'err', text: err.message || 'Failed to rename' })
    } finally {
      setSaving(false)
    }
  }

  function handleFirmwareCmd(e) {
    if (e.key === 'Enter' && firmwareCmd.trim()) {
      setFirmwareLog(prev => [...prev, { text: `$ ${firmwareCmd}`, type: 'info' }])
      setFirmwareCmd('')
    }
  }

  if (loading) return <LoadingState message="Loading device configuration..." icon="developer_board" />
  if (error && devices.length === 0) return <ErrorState message={error} onRetry={loadData} />
  if (devices.length === 0) return <EmptyState icon="developer_board" title="No devices" message="Connect a device to configure hardware settings." />

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg text-on-surface mb-1">Device Configuration</h1>
            <p className="text-on-surface-variant text-body-md">Identity, telemetry and actuator status.</p>
          </div>
          <select
            className="bg-surface-container border border-outline-variant rounded-md text-body-md text-on-surface px-3 py-1.5 cursor-pointer"
            value={selectedId || ''}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.chamberName || d.deviceId}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">badge</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">IDENTITY</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">DEVICE ID</p>
                <p className="font-mono text-data-sm text-secondary tracking-widest">{device?.deviceId || '—'}</p>
              </div>
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">CHAMBER NAME</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    placeholder="Enter name..."
                  />
                  <button
                    onClick={handleRename}
                    disabled={saving || !renameValue.trim()}
                    className="px-3 py-1.5 bg-primary text-on-primary font-label-caps text-10px rounded hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    {saving ? '...' : 'SAVE'}
                  </button>
                </div>
                {renameMsg && (
                  <p className={`text-10px mt-1 ${renameMsg.type === 'ok' ? 'text-primary' : 'text-error'}`}>{renameMsg.text}</p>
                )}
              </div>
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">STATUS</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${device?.status === 'ONLINE' ? 'bg-primary breathing-pulse' : 'bg-outline-variant'}`} />
                  <span className="font-mono text-data-sm text-on-surface">{device?.status || '—'}</span>
                </div>
              </div>
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">MAC ADDRESS</p>
                <p className="font-mono text-data-sm text-on-surface">{device?.macAddress || '—'}</p>
              </div>
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">FIRMWARE</p>
                <p className="font-mono text-data-sm text-on-surface">{device?.firmwareVersion || '—'}</p>
              </div>
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">LAST SEEN</p>
                <p className="font-mono text-data-sm text-on-surface">{device?.lastSeen ? new Date(device.lastSeen).toLocaleString() : '—'}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-4">
          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary">sensors</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">LATEST TELEMETRY</h3>
              <span className="text-10px text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">REALTIME</span>
            </div>
            {!telemetry ? (
              <p className="text-body-md text-on-surface-variant py-4 text-center">No telemetry data available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {SENSOR_TYPES.map(st => {
                  const value = telemetry[st.key]
                  const unitKey = `${st.key}_unit`
                  const unit = telemetry[unitKey] || st.unit
                  return (
                    <div key={st.key} className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/30">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-sm text-on-surface-variant">{st.icon}</span>
                        <span className="font-label-caps text-9px text-on-surface-variant">{st.label}</span>
                      </div>
                      <p className="text-headline-md text-primary">{value != null ? `${value}${unit}` : '—'}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">settings_power</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">ACTUATOR STATUS</h3>
            </div>
            {actuators.length === 0 ? (
              <p className="text-body-md text-on-surface-variant py-4 text-center">No actuators configured</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {actuators.map(a => {
                  const isOn = a.state === 'ON'
                  return (
                    <div key={a.channel} className={`p-4 rounded-lg border text-center transition-all ${isOn ? 'bg-primary/10 border-primary/30' : 'bg-surface-container-low border-outline-variant/30'}`}>
                      <span className="text-9px font-label-caps text-on-surface-variant">CH{a.channel}</span>
                      <p className="text-10px mt-1 font-semibold text-on-surface">{a.label || `Actuator ${a.channel}`}</p>
                      <p className="font-mono text-data-sm mt-2">{a.state || '—'}</p>
                      <div className={`mt-2 w-2 h-2 rounded-full mx-auto ${isOn ? 'bg-primary breathing-pulse' : 'bg-outline-variant'}`} />
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="glass-card rounded-xl border border-outline-variant overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">terminal</span>
                <h3 className="font-label-caps text-label-caps text-on-surface">FIRMWARE TERMINAL</h3>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-error" />
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            </div>
            <div className="p-4 font-mono text-data-sm text-primary/80 bg-black/40 min-h-[200px] max-h-[260px] overflow-y-auto" style={{ fontFamily: 'var(--font-mono)' }}>
              {firmwareLog.length === 0 && (
                <p className="text-on-surface-variant mb-2">Terminal ready. Type a command.</p>
              )}
              {firmwareLog.map((entry, i) => (
                <div key={i} className={`mb-1 ${entry.type === 'err' ? 'text-error' : 'text-on-surface-variant'}`}>
                  {entry.text}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-secondary">$</span>
                <input
                  className="bg-transparent border-none p-0 focus:ring-0 text-primary w-full outline-none font-mono"
                  type="text"
                  value={firmwareCmd}
                  onChange={e => setFirmwareCmd(e.target.value)}
                  onKeyDown={handleFirmwareCmd}
                  placeholder="Type command..."
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default DeviceSettings
