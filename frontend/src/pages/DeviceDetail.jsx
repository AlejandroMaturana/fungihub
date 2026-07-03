import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDevice, getActuators, setActuatorDirect } from '../api/client.js'
import { useSSE } from '../api/useSSE.js'
import ArcGauge from '../components/ui/ArcGauge.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import ActuatorControl from '../components/device/ActuatorControl.jsx'

const ACTUATOR_META = {
  1: { label: 'AIR EXCHANGE', icon: 'air', color: 'primary' },
  2: { label: 'MIST SPRAYERS', icon: 'water_drop', color: 'primary' },
  3: { label: 'CO2 INJECTION', icon: 'co2', color: 'error' },
  4: { label: 'UV-C STERILIZER', icon: 'light', color: 'secondary' },
}

const SPARKLINES = {
  temp: '0,10 10,11 20,10 30,9 40,10 50,11 60,10 70,9 80,10 90,11 100,10',
  hum: '0,12 10,10 20,18 30,5 40,8 50,2 60,10 70,14 80,8 90,12 100,10',
  co2: '0,15 10,12 20,18 30,5 40,8 50,2 60,10 70,14 80,8 90,12 100,10',
  o2: '0,5 20,8 40,5 60,6 80,4 100,5',
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
  const prevTelemetry = useRef({})

  const addLog = useCallback((text, type = 'info') => {
    const ts = new Date().toLocaleTimeString('en-GB', { hour12: false })
    setLogs(prev => [{ ts, text, type }, ...prev].slice(0, 20))
  }, [])

  const cancelledRef = useRef(false)

  async function loadData() {
    try {
      const [dev, acts] = await Promise.all([getDevice(id), getActuators(id)])
      if (cancelledRef.current) return
      setDevice(dev)
      setActuators(acts)
      setError(null)
      addLog('System initialized. Chamber telemetry active.', 'success')
    } catch (err) {
      if (!cancelledRef.current) setError(err.message || 'Connection error')
    } finally {
      if (!cancelledRef.current) setLoading(false)
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
        const prev = prevTelemetry.current
        const s = data.sensors
        if (s.temperature != null && prev.temperature != null && Math.abs(s.temperature - prev.temperature) > 0.2) {
          addLog(`Temperature ${s.temperature > prev.temperature ? '▲' : '▼'} ${s.temperature.toFixed(1)}°C`, 'info')
        }
        if (s.humidity != null && prev.humidity != null && Math.abs(s.humidity - prev.humidity) > 1) {
          addLog(`Humidity ${s.humidity > prev.humidity ? '▲' : '▼'} ${s.humidity.toFixed(0)}%`, 'info')
        }
        if (s.co2 != null && prev.co2 != null && Math.abs(s.co2 - prev.co2) > 50) {
          const warnLevel = s.co2 > 2000 ? 'error' : s.co2 > 1500 ? 'warn' : 'info'
          addLog(`CO₂ ${s.co2 > prev.co2 ? '▲' : '▼'} ${s.co2} ppm`, warnLevel)
        }
        prevTelemetry.current = {
          temperature: s.temperature,
          humidity: s.humidity,
          co2: s.co2,
        }
        setTelemetry(prev => ({
          ...prev,
          temperature: s.temperature,
          humidity: s.humidity,
          co2: s.co2,
          voc: s.voc,
          ts: new Date().toISOString(),
        }))
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
      const label = ACTUATOR_META[ch]?.label || `CH${ch}`
      if (data.status === 'ACKED') {
        addLog(`${label} → ACKED (${data.actuatorState.state})`, 'success')
      } else if (data.status === 'TIMEOUT') {
        addLog(`${label} → TIMEOUT`, 'error')
      }
    }
  }, [device, addLog]))

  function getCmdState(act) {
    if (pendingChannels.has(act.channel)) return 'PENDING'
    if (act.lastAck === 'ACKED') return 'ACKED'
    if (act.lastAck === 'TIMEOUT') return 'TIMEOUT'
    return null
  }

  async function handleToggle(channel) {
    const act = actuators.find(a => a.channel === channel)
    if (!act) return
    const newState = act.state === 'ON' ? 'OFF' : 'ON'
    const label = ACTUATOR_META[channel]?.label || `CH${channel}`
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <span className="material-symbols-outlined text-48px text-on-surface-variant mb-4">sensors_off</span>
        <p className="text-body-md text-on-surface-variant">Device not found</p>
      </div>
    </div>
  )

  const isOnline = device.status === 'ONLINE' || device.status === 'ACTIVE'
  const has = {
    temp: telemetry.temperature != null,
    hum: telemetry.humidity != null,
    co2: telemetry.co2 != null,
  }
  const hasTelemetry = has.temp || has.hum || has.co2
  const co2Error = has.co2 && telemetry.co2 > 2000

  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-label-caps text-label-caps transition-colors mb-1"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span className="material-symbols-outlined text-16px">arrow_back</span>
        BACK TO DASHBOARD
      </button>

      <section className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-lg text-on-surface">{device.chamberName || device.deviceId}</h1>
            <StatusBadge status={isOnline ? 'online' : 'critical'} label={isOnline ? 'ONLINE' : device.status} />
          </div>
          <p className="text-body-md text-on-surface-variant">Active Mycelium Colonization Phase</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-surface-container-high px-3 py-1 rounded text-10px font-label-caps text-secondary flex items-center gap-1 border border-outline-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" style={{ boxShadow: '0 0 8px var(--teal)' }} />
            SYSTEM NOMINAL
          </span>
          {co2Error && (
            <span className="bg-error-container/20 px-3 py-1 rounded text-10px font-label-caps text-error flex items-center gap-1 border border-error/30">
              <span className="material-symbols-outlined text-12px">warning</span>
              SENSOR FAILURE
            </span>
          )}
          {!hasTelemetry && (
            <span className="bg-surface-container-high px-3 py-1 rounded text-10px font-label-caps text-amber flex items-center gap-1 border border-amber/30">
              <span className="material-symbols-outlined text-12px animate-pulse">graphic_eq</span>
              AWAITING DATA
            </span>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-surface-container p-2 rounded border border-outline-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-16px">water_drop</span>
          <div className="flex flex-col min-w-0">
            <span className="text-8px font-label-caps text-on-surface-variant">HUMIDITY</span>
            <span className="text-headline-md text-on-surface">{has.hum ? `${Math.round(telemetry.humidity)}%` : '--%'}</span>
          </div>
        </div>
        <div className="bg-surface-container p-2 rounded border border-outline-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-16px">thermostat</span>
          <div className="flex flex-col min-w-0">
            <span className="text-8px font-label-caps text-on-surface-variant">TEMPERATURE</span>
            <span className="text-headline-md text-on-surface">{has.temp ? `${Math.round(telemetry.temperature * 10) / 10}°C` : '--°C'}</span>
          </div>
        </div>
        <div className={`bg-surface-container-low p-2 rounded flex items-center gap-2 relative${co2Error ? ' border border-error/40' : ' border border-outline-variant'}`}
          style={co2Error ? { boxShadow: '0 0 10px var(--glow-error)' } : {}}>
          <span className="material-symbols-outlined text-error text-16px">co2</span>
          <div className="flex flex-col min-w-0">
            <span className="text-8px font-label-caps text-on-surface-variant">CO₂</span>
            <span className={`text-headline-md ${co2Error ? 'text-error' : 'text-on-surface'}`}>
              {has.co2 ? `${telemetry.co2}` : '--'}<span className="text-data-sm text-on-surface-variant ml-1">ppm</span>
            </span>
          </div>
          {co2Error && <span className="material-symbols-outlined text-error text-14px absolute top-1 right-1">report</span>}
        </div>
        <div className="bg-surface-container p-2 rounded border border-outline-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-16px">air</span>
          <div className="flex flex-col min-w-0">
            <span className="text-8px font-label-caps text-on-surface-variant">O₂</span>
            <span className="text-headline-md text-on-surface">19.8<span className="text-data-sm text-on-surface-variant ml-1">%</span></span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 bg-surface-container rounded border border-outline-variant flex flex-col h-[360px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-outline-variant">
            <span className="font-label-caps text-9px text-on-surface-variant">SYSTEM LOG</span>
            <span className="text-8px text-primary bg-primary/10 px-1.5 py-0.5 rounded">LIVE</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 text-11px font-mono leading-relaxed" style={{ scrollbarWidth: 'thin' }}>
            {logs.length === 0 && (
              <div className="opacity-30 p-2">[--:--:--] Waiting for data...</div>
            )}
            {logs.map((entry, i) => (
              <div key={i} className={`flex gap-2 py-0.5 ${i === 0 ? '' : 'opacity-60'}`}>
                <span className="text-outline shrink-0">{entry.ts}</span>
                <span className={
                  entry.type === 'error' ? 'text-error' :
                  entry.type === 'success' ? 'text-primary' :
                  entry.type === 'warn' ? 'text-tertiary' :
                  'text-on-surface-variant'
                }>{entry.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-surface-container rounded border border-outline-variant overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-outline-variant bg-surface-container-high flex items-center justify-between">
            <span className="font-label-caps text-9px text-on-surface-variant">ACTUATOR OVERRIDE MATRIX</span>
            <div className="flex items-center gap-2">
              <span className={`text-8px font-label-caps px-1.5 py-0.5 rounded border ${actuators.some(a => a.mode === 'REMOTE') ? 'text-primary border-primary/30 bg-primary/10' : 'text-on-surface-variant border-outline-variant'}`}>
                MODE: {actuators.some(a => a.mode === 'REMOTE') ? 'REMOTE' : 'MANUAL'}
              </span>
            </div>
          </div>
          <div className="flex-1 p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
              {[1, 2, 3, 4].map(ch => {
                const act = actuators.find(a => a.channel === ch) || { channel: ch, state: 'OFF', mode: 'LOCAL' }
                return (
                  <ActuatorControl
                    key={ch}
                    deviceId={device.deviceId}
                    actuator={act}
                    meta={ACTUATOR_META[ch]}
                    cmdState={getCmdState(act)}
                    onToggle={handleToggle}
                  />
                )
              })}
            </div>
            {cmdHistory.length > 0 && (
              <div className="border-t border-outline-variant pt-2">
                <span className="font-label-caps text-8px text-on-surface-variant block mb-1">COMMAND HISTORY</span>
                <div className="flex flex-wrap gap-1.5">
                  {cmdHistory.map((h, i) => {
                    const statusColors = {
                      PENDING: 'text-amber border-amber/30 bg-amber/10',
                      SENT: 'text-primary border-primary/30 bg-primary/10',
                      FAILED: 'text-error border-error/30 bg-error/10',
                    }
                    return (
                      <div key={i} className={`text-8px font-label-caps px-1.5 py-0.5 rounded border ${statusColors[h.status] || ''}`}>
                        {h.label} → {h.cmd}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            <div className="border-t border-outline-variant mt-2 pt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" style={{ boxShadow: '0 0 6px var(--teal)' }} />
                <span className="text-8px font-label-caps text-on-surface-variant">SUBSYSTEM NOMINAL</span>
              </div>
              <span className="text-8px font-label-caps text-on-surface-variant">
                CMD: {actuators.filter(a => a.lastAck === 'ACKED').length}/{actuators.length}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DeviceDetail
