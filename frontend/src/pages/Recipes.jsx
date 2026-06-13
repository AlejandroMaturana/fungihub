import { useState, useEffect } from 'react'
import { getRecipes, createRecipe } from '../api/client.js'

function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', species: '',
    incubationTempMin: '', incubationTempMax: '',
    incubationHumMin: '', incubationHumMax: '',
    incubationDurationDays: '',
    fruitingTempMin: '', fruitingTempMax: '',
    fruitingHumMin: '', fruitingHumMax: '',
    fruitingDurationDays: '',
    faeIntervalMinutes: '', ventilationStrategy: 'TIMER',
  })

  async function load() {
    try {
      setError(null)
      const data = await getRecipes()
      setRecipes(data)
    } catch (err) {
      setError(err.message || 'Error al cargar recetas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    try {
      await createRecipe({
        ...form,
        incubationTempMin: parseFloat(form.incubationTempMin),
        incubationTempMax: parseFloat(form.incubationTempMax),
        incubationHumMin: parseFloat(form.incubationHumMin),
        incubationHumMax: parseFloat(form.incubationHumMax),
        incubationDurationDays: parseInt(form.incubationDurationDays, 10),
        fruitingTempMin: parseFloat(form.fruitingTempMin),
        fruitingTempMax: parseFloat(form.fruitingTempMax),
        fruitingHumMin: parseFloat(form.fruitingHumMin),
        fruitingHumMax: parseFloat(form.fruitingHumMax),
        fruitingDurationDays: parseInt(form.fruitingDurationDays, 10),
        faeIntervalMinutes: parseInt(form.faeIntervalMinutes, 10),
      })
      setShowForm(false)
      setForm({ name: '', species: '', incubationTempMin: '', incubationTempMax: '', incubationHumMin: '', incubationHumMax: '', incubationDurationDays: '', fruitingTempMin: '', fruitingTempMax: '', fruitingHumMin: '', fruitingHumMax: '', fruitingDurationDays: '', faeIntervalMinutes: '', ventilationStrategy: 'TIMER' })
      await load()
    } catch (err) {
      setError(err.message || 'Error al crear receta')
    }
  }

  if (loading) return <div className="loading">Cargando recetas...</div>

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <h2>Recetas</h2>
        <button className="back-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nueva receta'}
        </button>
      </div>

      {error && <div className="error-state">{error}</div>}

      {showForm && (
        <form className="recipe-form" onSubmit={handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label>Nombre</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Especie</label>
              <input value={form.species} onChange={e => setForm({...form, species: e.target.value})} required />
            </div>
            <fieldset>
              <legend>Incubación</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Temp min (°C)</label>
                  <input type="number" step="0.1" value={form.incubationTempMin} onChange={e => setForm({...form, incubationTempMin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Temp max (°C)</label>
                  <input type="number" step="0.1" value={form.incubationTempMax} onChange={e => setForm({...form, incubationTempMax: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>HR min (%)</label>
                  <input type="number" step="0.1" value={form.incubationHumMin} onChange={e => setForm({...form, incubationHumMin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>HR max (%)</label>
                  <input type="number" step="0.1" value={form.incubationHumMax} onChange={e => setForm({...form, incubationHumMax: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Duración (días)</label>
                  <input type="number" value={form.incubationDurationDays} onChange={e => setForm({...form, incubationDurationDays: e.target.value})} />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>Fructificación</legend>
              <div className="form-row">
                <div className="form-group">
                  <label>Temp min (°C)</label>
                  <input type="number" step="0.1" value={form.fruitingTempMin} onChange={e => setForm({...form, fruitingTempMin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Temp max (°C)</label>
                  <input type="number" step="0.1" value={form.fruitingTempMax} onChange={e => setForm({...form, fruitingTempMax: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>HR min (%)</label>
                  <input type="number" step="0.1" value={form.fruitingHumMin} onChange={e => setForm({...form, fruitingHumMin: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>HR max (%)</label>
                  <input type="number" step="0.1" value={form.fruitingHumMax} onChange={e => setForm({...form, fruitingHumMax: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Duración (días)</label>
                  <input type="number" value={form.fruitingDurationDays} onChange={e => setForm({...form, fruitingDurationDays: e.target.value})} />
                </div>
              </div>
            </fieldset>
            <div className="form-row">
              <div className="form-group">
                <label>FAE intervalo (min)</label>
                <input type="number" value={form.faeIntervalMinutes} onChange={e => setForm({...form, faeIntervalMinutes: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Estrategia ventilación</label>
                <select value={form.ventilationStrategy} onChange={e => setForm({...form, ventilationStrategy: e.target.value})}>
                  <option value="TIMER">Timer</option>
                  <option value="CO2_TRIGGER">CO₂ Trigger</option>
                  <option value="HYBRID">Híbrido</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" className="submit-btn">Guardar receta</button>
        </form>
      )}

      {recipes.length === 0 ? (
        <div className="empty-state">
          <p>No hay recetas definidas</p>
        </div>
      ) : (
        <div className="recipes-table-wrap">
          <table className="recipes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especie</th>
                <th>Incubación</th>
                <th>Fructificación</th>
                <th>FAE</th>
                <th>Estrategia</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.id}>
                  <td className="recipe-name">{r.name}</td>
                  <td><em>{r.species}</em></td>
                  <td>{r.incubationDurationDays}d @ {r.incubationTempMin}–{r.incubationTempMax}°C</td>
                  <td>{r.fruitingDurationDays}d @ {r.fruitingTempMin}–{r.fruitingTempMax}°C</td>
                  <td>{r.faeIntervalMinutes}min</td>
                  <td>{r.ventilationStrategy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Recipes
