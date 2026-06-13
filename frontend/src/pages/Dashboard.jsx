import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { getDevices, getLatestTelemetry } from '../api/client.js'
import { useSSE } from '../api/useSSE.js'
import MetricCard from '../components/dashboard/MetricCard.jsx'

function Dashboard() {
  const [devices, setDevices] = useState([])
  const [telemetry, setTelemetry] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [alarms, setAlarms] = useState([])

  useEffect(() => {
    let interval
    async function fetchData() {
      try {
        const devs = await getDevices()
        setDevices(devs)
        if (devs.length > 0) {
          const tel = await getLatestTelemetry(devs[0].id)
          setTelemetry(tel)
        }
        setError(null)
      } catch (err) {
        setError(err.message || 'Error de conexión')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  useSSE(useCallback((type, data) => {
    if (type === 'telemetry') {
      setTelemetry(prev => ({
        ...prev,
        temperature: data.sensors?.temperature,
        humidity: data.sensors?.humidity,
        co2: data.sensors?.co2,
        voc: data.sensors?.voc,
        ts: new Date().toISOString(),
      }))
    }
    if (type === 'ack') {
      setDevices(prev => [...prev])
    }
  }, []))

  if (loading) return <div className="loading">Conectando...</div>
  if (error && devices.length === 0) return <div className="error-state">{error}</div>

  return (
    <div className="dashboard">
      {alarms.length > 0 && (
        <section>
          <div className="alarms-panel">
            <h3>Alertas</h3>
            {alarms.map((a, i) => (
              <div key={i} className="alarm-item">
                <span className="alarm-reason">{a.reason}</span>
                <span className="alarm-time">{new Date(a.ts).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {telemetry && Object.keys(telemetry).length > 0 && (
        <section>
          <h2 style={{ marginBottom: 16, fontSize: 18 }}>Última lectura</h2>
          <div className="metrics">
            {telemetry.temperature != null && (
              <MetricCard label="Temperatura" value={telemetry.temperature} unit="°C" ts={telemetry.ts} />
            )}
            {telemetry.humidity != null && (
              <MetricCard label="Humedad" value={telemetry.humidity} unit="%" ts={telemetry.ts} />
            )}
            {telemetry.co2 != null && (
              <MetricCard label="CO₂" value={telemetry.co2} unit="ppm" ts={telemetry.ts} />
            )}
            {telemetry.voc != null && (
              <MetricCard label="VOC" value={telemetry.voc} unit="ppb" ts={telemetry.ts} />
            )}
          </div>
        </section>
      )}

      <section>
        <h2 style={{ marginBottom: 16, fontSize: 18 }}>Dispositivos</h2>
        {devices.length === 0 ? (
          <div className="empty-state">
            <p>No hay dispositivos registrados</p>
            <p style={{ marginTop: 8, fontSize: 13 }}>Esperando conexión de un controlador Mush2...</p>
          </div>
        ) : (
          <div className="metrics">
            {devices.map((d) => (
              <Link key={d.id} to={`/devices/${d.id}`} className="device-link">
                <div className="device-card">
                  <h3>{d.deviceId}</h3>
                  <span className={`status ${d.status}`}>{d.status}</span>
                  <div className="device-meta">
                    <span>FW: {d.firmwareVersion}</span>
                    <span>MAC: {d.macAddress}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Dashboard
