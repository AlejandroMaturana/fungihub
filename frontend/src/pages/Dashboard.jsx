import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDevices, getLatestTelemetry } from '../api/client.js'
import { useSSE } from '../api/useSSE.js'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DevicesEmptyState from '../components/ui/DevicesEmptyState.jsx'

function DeviceRow({ device, telemetry }) {
  const navigate = useNavigate()
  const isOnline = device.status === 'ONLINE'
  return (
    <tr
      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
      onClick={() => navigate(`/fleet/devices/${device.id}`)}
    >
      <td style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{device.chamberName || device.deviceId}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--outline)', marginTop: '2px' }}>
              {device.deviceId}
            </div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px' }}>
        <StatusBadge status={isOnline ? 'online' : 'offline'} label={device.status} />
      </td>
      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
        {telemetry?.temperature != null ? (
          <span style={{ color: 'var(--spore-green)' }}>{telemetry.temperature.toFixed(1)}</span>
        ) : '--'}
        <span style={{ marginLeft: '2px', fontSize: '11px' }}>{telemetry?.temperature != null ? '°C' : ''}</span>
      </td>
      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
        {telemetry?.humidity != null ? (
          <span style={{ color: 'var(--teal)' }}>{telemetry.humidity.toFixed(1)}</span>
        ) : '--'}
        <span style={{ marginLeft: '2px', fontSize: '11px' }}>{telemetry?.humidity != null ? '%' : ''}</span>
      </td>
      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
        {telemetry?.co2 != null ? (
          <span>{telemetry.co2}</span>
        ) : '--'}
        <span style={{ marginLeft: '2px', fontSize: '11px' }}>{telemetry?.co2 != null ? 'ppm' : ''}</span>
      </td>
      <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--on-surface-variant)' }}>
        {telemetry?.voc != null ? (
          <span>{telemetry.voc}</span>
        ) : '--'}
        <span style={{ marginLeft: '2px', fontSize: '11px' }}>{telemetry?.voc != null ? 'ppb' : ''}</span>
      </td>
      <td style={{ padding: '12px', textAlign: 'right' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--on-surface-variant)' }}>chevron_right</span>
      </td>
    </tr>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const [devices, setDevices] = useState([])
  const [telemetryMap, setTelemetryMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const cancelledRef = useRef(false)

  async function fetchData() {
    try {
      const devs = await getDevices()
      if (cancelledRef.current) return
      setDevices(devs)

      const allTel = await Promise.all(devs.map(d => getLatestTelemetry(d.id).catch(() => null)))
      if (cancelledRef.current) return

      const map = {}
      devs.forEach((d, i) => { map[d.id] = allTel[i] })
      setTelemetryMap(map)
      setError(null)
    } catch (err) {
      if (!cancelledRef.current) setError(err.message || 'Error de conexión')
    } finally {
      if (!cancelledRef.current) setLoading(false)
    }
  }

  useEffect(() => {
    cancelledRef.current = false
    fetchData()
    return () => { cancelledRef.current = true }
  }, [])

  useSSE(useCallback((type, data) => {
    if (type === 'telemetry') {
      const dev = devices.find(d => d.deviceId === data.deviceId)
      if (dev) {
        const update = {
          temperature: data.sensors?.temperature,
          humidity: data.sensors?.humidity,
          co2: data.sensors?.co2,
          voc: data.sensors?.voc,
        }
        setTelemetryMap(prev => ({ ...prev, [dev.id]: { ...prev[dev.id], ...update } }))
      }
    }
  }, [devices]))

  if (loading) return <LoadingState message="Connecting to system..." icon="settings_ethernet" />
  if (error && devices.length === 0) {
    return <ErrorState message={error} onRetry={fetchData} />
  }

  const onlineCount = devices.filter(d => d.status === 'ONLINE').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Devices</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--outline)' }}>
            {devices.length} device{devices.length !== 1 ? 's' : ''} registered
            {onlineCount > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--spore-green)' }}>
                <span className="status-dot online" style={{ display: 'inline-block', width: '6px', height: '6px', marginRight: '4px' }} />
                {onlineCount} online
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/fleet/provision')}
          className="btn btn-glow"
          style={{ padding: '8px 16px', fontSize: '11px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          ADD DEVICE
        </button>
      </div>

      {/* Device Table */}
      {devices.length > 0 ? (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Device</th>
                <th>Status</th>
                <th>Temperature</th>
                <th>Humidity</th>
                <th>CO₂</th>
                <th>VOC</th>
                <th style={{ width: '40px' }} />
              </tr>
            </thead>
            <tbody>
              {devices.map(device => (
                <DeviceRow key={device.id} device={device} telemetry={telemetryMap[device.id]} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '16px', display: 'block' }}>sensors_off</span>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>No devices registered</h3>
          <p style={{ fontSize: '13px', color: 'var(--outline)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Connect your first Mush2 chamber to start monitoring and controlling your cultivation environment.
          </p>
          <button onClick={fetchData} className="btn btn-ghost" style={{ fontSize: '11px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>refresh</span>
            Retry Connection
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
