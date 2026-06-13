import { useState } from 'react'
import { useAuth } from '../api/AuthContext.jsx'

function Settings() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard">
      <section>
        <h2 style={{ marginBottom: 16, fontSize: 20 }}>Mi Cuenta</h2>
        <div style={{ background: 'var(--surface)', padding: 20, borderRadius: 'var(--radius)', border: '1px solid var(--surface2)' }}>
          <div className="cycle-info"><span className="cycle-label">Usuario:</span><span className="cycle-value">{user?.username}</span></div>
          <div className="cycle-info"><span className="cycle-label">Email:</span><span className="cycle-value">{user?.email || '-'}</span></div>
          <div className="cycle-info"><span className="cycle-label">Rol:</span><span className="cycle-value">{user?.role}</span></div>
        </div>
      </section>

      <section>
        <button className="back-btn" onClick={logout} style={{ color: 'var(--red)' }}>Cerrar sesión</button>
      </section>
    </div>
  )
}

export default Settings
