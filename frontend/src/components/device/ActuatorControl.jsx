import { useState } from 'react'
import { setActuator } from '../../api/client.js'

const CHANNEL_LABELS = { 1: 'Calefacción', 2: 'Ventilación', 3: 'Humedad' }

function ActuatorControl({ deviceId, actuator, onCommandSent }) {
  const [sending, setSending] = useState(false)

  async function handleToggle() {
    const newState = actuator.state === 'ON' ? 'OFF' : 'ON'
    setSending(true)
    try {
      await setActuator(deviceId, actuator.channel, newState)
      if (onCommandSent) onCommandSent(actuator.channel, newState)
    } catch (err) {
      console.error('Error sending command:', err)
    } finally {
      setSending(false)
    }
  }

  const isOn = actuator.state === 'ON'
  const label = CHANNEL_LABELS[actuator.channel] || `Canal ${actuator.channel}`

  return (
    <div className={`actuator-control ${isOn ? 'on' : 'off'}`}>
      <div className="actuator-info">
        <span className="actuator-label">{label}</span>
        <span className="actuator-channel">CH{actuator.channel}</span>
      </div>
      <div className="actuator-state-row">
        <span className={`actuator-state ${isOn ? 'on' : 'off'}`}>
          {isOn ? 'ENCENDIDO' : 'APAGADO'}
        </span>
        {actuator.mode && (
          <span className="actuator-mode">{actuator.mode}</span>
        )}
      </div>
      <button
        className={`actuator-btn ${isOn ? 'off' : 'on'}`}
        onClick={handleToggle}
        disabled={sending}
      >
        {sending ? '...' : isOn ? 'Apagar' : 'Encender'}
      </button>
    </div>
  )
}

export default ActuatorControl
