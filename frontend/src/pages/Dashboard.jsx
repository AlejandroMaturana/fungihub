import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getDevices, getLatestTelemetry } from '../api/client.js'
import { useSSE } from '../api/useSSE.js'
import LoadingState from '../components/ui/LoadingState.jsx'
import ErrorState from '../components/ui/ErrorState.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import DevicesEmptyState from '../components/ui/DevicesEmptyState.jsx'

function DeviceRow({ device, telemetry }) {
  const isOnline = device.status === 'ONLINE'
  return (
    <Link to={`/devices/${device.id}`} className="no-underline" style={{ display: 'contents' }}>
      <tr className="hover:bg-surface-container-highest/40 transition-colors" style={{ cursor: 'pointer' }}>
        <td className="p-3">
          <div className="flex items-center gap-3">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <span className="text-body-md text-on-surface">{device.chamberName || device.deviceId}</span>
          </div>
        </td>
        <td className="p-3">
          <StatusBadge status={isOnline ? 'online' : 'offline'} label={device.status} />
        </td>
        <td className="p-3 font-mono text-data-sm text-on-surface-variant">
          {telemetry?.temperature != null ? `${telemetry.temperature.toFixed(1)} °C` : '--'}
        </td>
        <td className="p-3 font-mono text-data-sm text-on-surface-variant">
          {telemetry?.humidity != null ? `${telemetry.humidity.toFixed(1)} %` : '--'}
        </td>
        <td className="p-3 font-mono text-data-sm text-on-surface-variant">
          {telemetry?.co2 != null ? `${telemetry.co2} ppm` : '--'}
        </td>
        <td className="p-3 font-mono text-data-sm text-on-surface-variant">
          {telemetry?.voc != null ? `${telemetry.voc} ppb` : '--'}
        </td>
        <td className="p-3 text-right">
          <span className="material-symbols-outlined text-on-surface-variant text-18px">chevron_right</span>
        </td>
      </tr>
    </Link>
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

  return (
    <div className="dashboard">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-headline-lg text-on-surface mb-1">Devices</h1>
          <p className="text-body-md text-on-surface-variant">
            {devices.length} device{devices.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => navigate('/provisioning')}
          className="btn btn-primary"
        >
          <span className="material-symbols-outlined text-18px">add</span>
          ADD DEVICE
        </button>
      </div>

      {devices.length > 0 ? (
        <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
          <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-outline-variant text-label-caps text-9px text-on-surface-variant">
                <th className="p-3 font-weight-normal">Device</th>
                <th className="p-3 font-weight-normal">Status</th>
                <th className="p-3 font-weight-normal">Temperature</th>
                <th className="p-3 font-weight-normal">Humidity</th>
                <th className="p-3 font-weight-normal">CO₂</th>
                <th className="p-3 font-weight-normal">VOC</th>
                <th className="p-3" />
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
        <DevicesEmptyState onConnect={fetchData} />
      )}
    </div>
  )
}

export default Dashboard
