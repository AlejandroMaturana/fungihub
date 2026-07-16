import { useState, useEffect, useCallback } from 'react'
import { getDevice, getActuators, setActuatorDirect, getLatestTelemetry } from '../api/devices'
import { getTelegramDeviceConfig, updateTelegramDeviceConfig } from '../api/telegram'

export function useDevice(id) {
  const [device, setDevice] = useState(null)
  const [telemetry, setTelemetry] = useState({})
  const [actuators, setActuators] = useState([])
  const [tgConfig, setTgConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDevice = useCallback(async () => {
    try {
      setLoading(true)
      const [dev, acts] = await Promise.all([getDevice(id), getActuators(id)])
      setDevice(dev)
      setActuators(acts)
      setError(null)

      getTelegramDeviceConfig(id).then(cfg => setTgConfig(cfg)).catch(() => {})

      const latest = await getLatestTelemetry(id)
      if (latest?.temperature != null) {
        setTelemetry(prev => ({
          ...prev,
          temperature: latest.temperature,
          humidity: latest.humidity,
          co2: latest.co2,
          voc: latest.voc,
          ts: new Date().toISOString(),
        }))
      }
    } catch (err) {
      setError(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) loadDevice()
  }, [id, loadDevice])

  const updateTelemetry = useCallback((sensors) => {
    if (!sensors) return
    setTelemetry(prev => ({
      ...prev,
      temperature: sensors.temperature ?? prev.temperature,
      humidity: sensors.humidity ?? prev.humidity,
      co2: sensors.co2 ?? prev.co2,
      voc: sensors.voc ?? prev.voc,
      ts: new Date().toISOString(),
    }))
  }, [])

  const toggleActuator = useCallback(async (channel) => {
    const act = actuators.find(a => a.channel === channel)
    const newState = !act || act.state === 'OFF' ? 'ON' : 'OFF'
    await setActuatorDirect(device.deviceId, channel, newState)
    setActuators(prev => prev.map(a =>
      a.channel === channel ? { ...a, state: newState } : a
    ))
  }, [device, actuators])

  return {
    device, telemetry, actuators, tgConfig, loading, error,
    loadDevice, updateTelemetry, toggleActuator,
    setTgConfig, setActuators,
    updateTelegramConfig: async (payload) => {
      await updateTelegramDeviceConfig(id, payload)
      setTgConfig(prev => ({ ...prev, ...payload }))
    },
  }
}
