import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDevice, getActuators, setActuatorDirect, getLatestTelemetry, getTelegramDeviceConfig, updateTelegramDeviceConfig } from '../api/client.js'
import { useSSE } from '../api/useSSE.js'
import DomeGauge from '../components/ui/DomeGauge.jsx'
import ChartPanel from '../components/ui/ChartPanel.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import ActuatorControl from '../components/device/ActuatorControl.jsx'

const SENSOR_CFG = {
  temp: { label: 'Temperature', unit: '°C', min: 18, max: 35, optMin: 22, optMax: 28, decimals: 1, chartColor: '#f59e0b' },
  hum: { label: 'Humidity', unit: '%RH', min: 50, max: 100, optMin: 70, optMax: 90, decimals: 1, chartColor: '#38bdf8' },
  eco2: { label: 'eCO₂', unit: 'ppm', min: 400, max: 5000, optMin: 800, optMax: 2000, decimals: 0, chartColor: '#a78bfa' },
  tvoc: { label: 'TVOC', unit: 'ppb', min: 0, max: 2000, optMin: 0, optMax: 500, decimals: 0, chartColor: '#fb7185' },
}

function DeviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [telemetry, setTelemetry] = useState({})
  const [actuators, setActuators] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [logs, setLogs] = useState([])
  const [cmdHistory, setCmdHistory] = useState([])
  const [pendingChannels, setPendingChannels] = useState(new Set())
  const [tgConfig, setTgConfig] = useState(null)
  const [tgSaving, setTgSaving] = useState(false)

  const prevTelemetry = useRef({})
  const sparkHistory = useRef({ temp: [], hum: [], eco2: [], tvoc: [] })
  const cancelledRef = useRef(false)

  const addLog = useCallback((text, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLogs(prev => [{ ts, text, type }, ...prev].slice(0, 10))
  }, [])

  async function loadData() {
    try {
      const [dev, acts] = await Promise.all([getDevice(id), getActuators(id)])
      if (cancelledRef.current) return
      setDevice(dev)
      setActuators(acts)
      setError(null)
      addLog('System initialized. Chamber telemetry active.', 'success')

      getTelegramDeviceConfig(id).then(cfg => {
        if (!cancelledRef.current) setTgConfig(cfg)
      }).catch(() => {})

      const latest = await getLatestTelemetry(id)
      if (!cancelledRef.current && latest?.temperature != null) {
        applyTelemetry(latest, true)
      }
    } catch (err) {
      if (!cancelledRef.current) setError(err.message || 'Connection error')
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }

  function applyTelemetry(sensors, initial = false) {
    if (!sensors) return
    const prev = prevTelemetry.current
    if (!initial) {
      if (sensors.temperature != null && prev.temperature != null && Math.abs(sensors.temperature - prev.temperature) > 0.2) {
        addLog(`Temperature ${sensors.temperature > prev.temperature ? '▲' : '▼'} ${sensors.temperature.toFixed(1)}°C`, 'info')
      }
      if (sensors.humidity != null && prev.humidity != null && Math.abs(sensors.humidity - prev.humidity) > 1) {
        addLog(`Humidity ${sensors.humidity > prev.humidity ? '▲' : '▼'} ${sensors.humidity.toFixed(0)}%`, 'info')
      }
      if (sensors.co2 != null && prev.co2 != null && Math.abs(sensors.co2 - prev.co2) > 50) {
        const warnLevel = sensors.co2 > 2000 ? 'error' : sensors.co2 > 1500 ? 'warn' : 'info'
        addLog(`CO₂ ${sensors.co2 > prev.co2 ? '▲' : '▼'} ${sensors.co2} ppm`, warnLevel)
      }
      prevTelemetry.current = {
        temperature: sensors.temperature ?? prev.temperature,
        humidity: sensors.humidity ?? prev.humidity,
        co2: sensors.co2 ?? prev.co2,
      }
    }
    setTelemetry(prev => ({
      ...prev,
      temperature: sensors.temperature ?? prev.temperature,
      humidity: sensors.humidity ?? prev.humidity,
      co2: sensors.co2 ?? prev.co2,
      voc: sensors.voc ?? prev.voc,
      ts: new Date().toISOString(),
    }))
    if (!initial) pushHistory(sensors)
  }

  function pushHistory(sensors) {
    for (const sk of ['temp', 'hum', 'eco2', 'tvoc']) {
      const skey = sk === 'eco2' ? 'co2' : sk === 'tvoc' ? 'voc' : sk
      const v = sensors[skey]
      if (v != null) {
        const sh = sparkHistory.current[sk]
        sh.push(v)
        if (sh.length > 12) sh.shift()
      }
    }
  }

  useEffect(() => {
    cancelledRef.current = false
    loadData()
    return () => { cancelledRef.current = true }
  }, [id, addLog])

  useSSE(useCallback((type, data) => {
    if (type === 'telemetry' && device && data.deviceId === device.deviceId) {
      if (data.sensors) {
        applyTelemetry(data.sensors)
      }
    }
    if (type === 'ack') {
      const ch = data.actuatorState?.channel
      setActuators(prev => prev.map(a =>
        a.channel === ch
          ? { ...a, state: data.actuatorState.state, lastAck: data.status }
          : a
      ))
      setPendingChannels(prev => {
        const next = new Set(prev)
        next.delete(ch)
        return next
      })
      const label = actuators.find(a => a.channel === ch)?.label || `CH${ch}`
      if (data.status === 'ACKED') {
        addLog(`${label} → ACKED (${data.actuatorState.state})`, 'success')
      } else if (data.status === 'TIMEOUT') {
        addLog(`${label} → TIMEOUT`, 'error')
      }
    }
  }, [device, actuators, addLog]))

  function getCmdState(act) {
    if (pendingChannels.has(act.channel)) return 'PENDING'
    if (act.lastAck === 'ACKED') return 'ACKED'
    if (act.lastAck === 'TIMEOUT') return 'TIMEOUT'
    return null
  }

  async function handleToggle(channel) {
    const act = actuators.find(a => a.channel === channel)
    const newState = !act || act.state === 'OFF' ? 'ON' : 'OFF'
    const label = act?.label || `CH${channel}`
    setPendingChannels(prev => new Set([...prev, channel]))
    addLog(`${label} → CMD ${newState}`, 'warn')
    setCmdHistory(prev => [{
      channel,
      label,
      cmd: newState,
      ts: new Date().toLocaleTimeString('en-GB', { hour12: false }),
      status: 'PENDING',
    }, ...prev].slice(0, 8))
    try {
      await setActuatorDirect(device.deviceId, channel, newState)
      setActuators(prev => prev.map(a =>
        a.channel === channel ? { ...a, state: newState } : a
      ))
      setPendingChannels(prev => {
        const next = new Set(prev)
        next.delete(channel)
        return next
      })
      setCmdHistory(prev => prev.map(h =>
        h.channel === channel && h.status === 'PENDING'
          ? { ...h, status: 'SENT' }
          : h
      ))
    } catch (err) {
      setPendingChannels(prev => {
        const next = new Set(prev)
        next.delete(channel)
        return next
      })
      addLog(`${label} → FAILED: ${err.response?.data?.error || 'timeout'}`, 'error')
      setCmdHistory(prev => prev.map(h =>
        h.channel === channel && h.status === 'PENDING'
          ? { ...h, status: 'FAILED' }
          : h
      ))
    }
  }

  if (loading) return <LoadingState message="Connecting to device..." icon="sync" />
  if (error) return <ErrorState message={error} onRetry={loadData} />

  if (!device) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '16px', display: 'block' }}>sensors_off</span>
        <p style={{ fontSize: '14px', color: 'var(--outline)' }}>Device not found</p>
      </div>
    </div>
  )

  const isOnline = device.status === 'ONLINE'
  const has = {
    temp: telemetry.temperature != null,
    hum: telemetry.humidity != null,
    eco2: telemetry.co2 != null,
    tvoc: telemetry.voc != null,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/overview')}
        className="btn btn-ghost"
        style={{ alignSelf: 'flex-start', padding: '6px 12px', fontSize: '11px' }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        BACK TO DASHBOARD
      </button>

      {/* Device Header */}
      <section className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} style={{ width: '12px', height: '12px' }} />
            <div>
              <h1 className="gradient-title" style={{ fontSize: '24px', marginBottom: '4px' }}>{device.chamberName || device.deviceId}</h1>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--outline)' }}>
                {device.hwRevision ? `HW ${device.hwRevision} · ` : ''}Firmware {device.firmwareVersion} · {device.macAddress || 'MAC —'}
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--outline)', marginTop: '4px' }}>
                Last seen {device.lastSeen ? new Date(device.lastSeen).toLocaleString() : 'never'}
              </p>
            </div>
          </div>
          <StatusBadge status={isOnline ? 'online' : 'critical'} label={isOnline ? 'ONLINE' : device.status} />
        </div>
      </section>

      {/* Telemetry + System Log */}
      <section style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {/* Telemetry Gauges */}
        <div className="glass-card" style={{ flex: '1 1 65%', minWidth: '300px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--spore-green)' }}>sensors</span>
            <span className="chart-panel-label">TELEMETRY</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <DomeGauge value={has.temp ? telemetry.temperature : SENSOR_CFG.temp.min} prevValue={telemetry.temperature} min={SENSOR_CFG.temp.min} max={SENSOR_CFG.temp.max} optMin={SENSOR_CFG.temp.optMin} optMax={SENSOR_CFG.temp.optMax} unit={SENSOR_CFG.temp.unit} label={SENSOR_CFG.temp.label} decimals={SENSOR_CFG.temp.decimals} history={sparkHistory.current.temp} noData={!has.temp} />
            <DomeGauge value={has.hum ? telemetry.humidity : SENSOR_CFG.hum.min} prevValue={telemetry.humidity} min={SENSOR_CFG.hum.min} max={SENSOR_CFG.hum.max} optMin={SENSOR_CFG.hum.optMin} optMax={SENSOR_CFG.hum.optMax} unit={SENSOR_CFG.hum.unit} label={SENSOR_CFG.hum.label} decimals={SENSOR_CFG.hum.decimals} history={sparkHistory.current.hum} noData={!has.hum} />
            <DomeGauge value={has.eco2 ? telemetry.co2 : SENSOR_CFG.eco2.min} prevValue={telemetry.co2} min={SENSOR_CFG.eco2.min} max={SENSOR_CFG.eco2.max} optMin={SENSOR_CFG.eco2.optMin} optMax={SENSOR_CFG.eco2.optMax} unit={SENSOR_CFG.eco2.unit} label={SENSOR_CFG.eco2.label} decimals={SENSOR_CFG.eco2.decimals} history={sparkHistory.current.eco2} noData={!has.eco2} />
            <DomeGauge value={has.tvoc ? telemetry.voc : SENSOR_CFG.tvoc.min} prevValue={telemetry.voc} min={SENSOR_CFG.tvoc.min} max={SENSOR_CFG.tvoc.max} optMin={SENSOR_CFG.tvoc.optMin} optMax={SENSOR_CFG.tvoc.optMax} unit={SENSOR_CFG.tvoc.unit} label={SENSOR_CFG.tvoc.label} decimals={SENSOR_CFG.tvoc.decimals} history={sparkHistory.current.tvoc} noData={!has.tvoc} />
          </div>
        </div>

        {/* System Log */}
        <div className="glass-card" style={{ flex: '1 1 30%', minWidth: '250px', padding: 0, overflow: 'hidden' }}>
          <div className="terminal-header" style={{ borderBottom: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--spore-green)' }}>terminal</span>
              <span className="chart-panel-label">SYSTEM LOG</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              fontWeight: 700,
              color: 'var(--spore-green)',
              background: 'rgba(var(--spore-green-rgb), 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}>LIVE</span>
          </div>
          <div className="terminal-body">
            {logs.length === 0 && (
              <div style={{ opacity: 0.3, padding: '4px' }}>[--:--:--] Waiting for data...</div>
            )}
            {logs.map((entry, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '8px',
                padding: '2px 0',
                opacity: i === 0 ? 1 : 0.5,
              }}>
                <span style={{ color: 'var(--outline)', flexShrink: 0 }}>{entry.ts}</span>
                <span style={{
                  color: entry.type === 'error' ? 'var(--error-red)' :
                    entry.type === 'success' ? 'var(--spore-green)' :
                    entry.type === 'warn' ? 'var(--amber)' :
                    'var(--on-surface-variant)',
                }}>{entry.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actuators */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{
          background: 'rgba(var(--surface-container-rgb, 30, 41, 59), 0.3)',
          padding: '10px 16px',
          borderBottom: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--spore-green)' }}>grid_view</span>
            <span className="chart-panel-label">ACTUATORS</span>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid',
            borderColor: actuators.some(a => a.mode === 'REMOTE') ? 'rgba(107,251,154,0.3)' : 'var(--outline-variant)',
            background: actuators.some(a => a.mode === 'REMOTE') ? 'rgba(107,251,154,0.1)' : 'transparent',
            color: actuators.some(a => a.mode === 'REMOTE') ? 'var(--spore-green)' : 'var(--on-surface-variant)',
          }}>
            MODE: {actuators.some(a => a.mode === 'REMOTE') ? 'REMOTE' : 'LOCAL'}
          </span>
        </div>
        <div className="grid" style={{ height: '140px', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[1, 2, 3, 4].map((ch, idx) => {
            const act = actuators.find(a => a.channel === ch) || { channel: ch, state: 'OFF', mode: 'LOCAL', label: `CH${ch}` }
            return (
              <div key={ch} style={{ borderRight: idx < 3 ? '1px solid var(--outline-variant)' : 'none' }}>
                <ActuatorControl
                  actuator={act}
                  meta={{ label: act.label || `CH${ch}`, icon: 'settings', color: 'primary' }}
                  cmdState={getCmdState(act)}
                  onToggle={handleToggle}
                />
              </div>
            )
          })}
        </div>
        <div style={{
          background: 'var(--surface-container-lowest)',
          padding: '8px 16px',
          borderTop: '1px solid var(--outline-variant)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--spore-green)', display: 'inline-block' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--on-surface-variant)' }}>
                {actuators.filter(a => a.lastAck === 'ACKED').length}/{actuators.length} ACKED
              </span>
            </div>
            <span style={{ width: '1px', height: '12px', background: 'var(--outline-variant)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--on-surface-variant)' }}>
              LATEST: {logs[0] ? `[${logs[0].ts}] ${logs[0].text}` : '--:--:-- waiting...'}
            </span>
          </div>
        </div>
      </div>

      {/* Telegram Config */}
      {tgConfig && (
        <section className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--outline-variant)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--spore-green)' }}>send</span>
              <span className="chart-panel-label">TELEGRAM ALERTS</span>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--on-surface-variant)' }}>ENABLED</span>
              <input type="checkbox" className="toggle-checkbox" checked={tgConfig.enabled} onChange={async e => {
                const val = e.target.checked
                setTgConfig(prev => ({ ...prev, enabled: val }))
                setTgSaving(true)
                try { await updateTelegramDeviceConfig(id, { enabled: val }) } catch {}
                setTgSaving(false)
              }} />
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px', display: 'block' }}>MIN SEVERITY</label>
              <select className="form-select" value={tgConfig.minSeverity} onChange={async e => {
                const val = e.target.value
                setTgConfig(prev => ({ ...prev, minSeverity: val }))
                setTgSaving(true)
                try { await updateTelegramDeviceConfig(id, { minSeverity: val }) } catch {}
                setTgSaving(false)
              }}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              {tgSaving && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)' }}>SAVING...</span>}
            </div>
            {[
              { key: 'alertOnFault', label: 'SENSOR FAULT' },
              { key: 'alertOnRange', label: 'OUT OF RANGE' },
              { key: 'alertOnDisconnect', label: 'DISCONNECT' },
              { key: 'alertOnSystem', label: 'SYSTEM ERROR' },
            ].map(({ key, label }) => (
              <div key={key} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                background: 'var(--surface-container)',
                borderRadius: '8px',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
                <input type="checkbox" className="toggle-checkbox" checked={tgConfig[key]} onChange={async e => {
                  const val = e.target.checked
                  setTgConfig(prev => ({ ...prev, [key]: val }))
                  try { await updateTelegramDeviceConfig(id, { [key]: val }) } catch {}
                }} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chart Panel */}
      <ChartPanel deviceId={id} telemetry={telemetry} has={has} />
    </div>
  )
}

export default DeviceDetail
