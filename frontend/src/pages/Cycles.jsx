import { useState, useEffect } from 'react'
import { getCycles, getRecipes, createRecipe } from '../api/client.js'

const PHASE_LABELS = { INCUBATION: 'Incubación', FRUITING: 'Fructificación', MAINTENANCE: 'Mantenimiento', COMPLETED: 'Completado' }
const STATUS_LABELS = { PLANNED: 'Planificado', ACTIVE: 'Activo', COMPLETED: 'Completado', ABORTED: 'Abortado' }

function Cycles() {
  const [cycles, setCycles] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ recipeId: '', species: '', strain: '', startDate: '' })

  async function load() {
    try {
      setError(null)
      const [c, r] = await Promise.all([getCycles(), getRecipes()])
      setCycles(c)
      setRecipes(r)
    } catch (err) {
      setError(err.message || 'Error al cargar ciclos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="loading">Cargando ciclos...</div>

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <h2>Ciclos de Cultivo</h2>
        <button className="back-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo ciclo'}
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {cycles.length === 0 ? (
        <div className="empty-state">
          <p>No hay ciclos de cultivo activos</p>
          <p style={{ marginTop: 8, fontSize: 13 }}>Crea un nuevo ciclo para comenzar</p>
        </div>
      ) : (
        <div className="cycles-grid">
          {cycles.map(c => (
            <div key={c.id} className={`cycle-card ${c.status}`}>
              <div className="cycle-header">
                <h3>{c.strain || c.species}</h3>
                <span className={`cycle-status ${c.status}`}>{STATUS_LABELS[c.status]}</span>
              </div>
              <div className="cycle-body">
                <div className="cycle-info">
                  <span className="cycle-label">Especie</span>
                  <span className="cycle-value"><em>{c.species}</em></span>
                </div>
                <div className="cycle-info">
                  <span className="cycle-label">Fase actual</span>
                  <span className={`cycle-phase ${c.currentPhase}`}>{PHASE_LABELS[c.currentPhase]}</span>
                </div>
                {c.Recipe && (
                  <div className="cycle-info">
                    <span className="cycle-label">Receta</span>
                    <span className="cycle-value">{c.Recipe.name}</span>
                  </div>
                )}
                {c.startDate && (
                  <div className="cycle-info">
                    <span className="cycle-label">Inicio</span>
                    <span className="cycle-value">{new Date(c.startDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Cycles
