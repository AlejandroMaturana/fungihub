import { useState } from 'react'
import { useAuth } from '../api/AuthContext.jsx'
import { login } from '../api/client.js'

function Login() {
  const { login: authLogin } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await login(username, password)
      authLogin(result.user, result.token.accessToken, result.token.refreshToken)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 style={{ color: 'var(--accent)', fontSize: 28, marginBottom: 8 }}>Mush2</h1>
        <p style={{ color: 'var(--text2)', marginBottom: 24 }}>Control de Ambientes</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>
          {error && <div className="error-state" style={{ padding: 12 }}>{error}</div>}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
