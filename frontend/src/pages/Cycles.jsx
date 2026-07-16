import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCycles, getRecipes, createCycle, updateCycle, getDevices } from '../api/client.js'
import LoadingState from '../components/ui/LoadingState.jsx'

const STATUS_LABELS = { PLANNED: 'Planned', ACTIVE: 'Active', COMPLETED: 'Completed', ABORTED: 'Aborted' }
const PHASE_LABELS = { INCUBATION: 'Incubation', FRUITING: 'Fruiting', MAINTENANCE: 'Maintenance', COMPLETED: 'Completed' }

function CycleCard({ cycle, onUpdate }) {
  const { status, currentPhase, species, strain, startDate, endDate, Recipe } = cycle
  const isActive = status === 'ACTIVE'
  const isPlanned = status === 'PLANNED'

  async function handleUpdate(payload) {
    try {
      await updateCycle(cycle.id, payload)
      onUpdate()
    } catch (err) {
      console.error('Error updating cycle:', err)
    }
  }

  return (
    <div className="glass-card" style={{
      padding: '20px',
      borderLeft: `4px solid ${isActive ? 'var(--spore-green)' : isPlanned ? 'var(--amber)' : 'var(--outline-variant)'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? 'var(--spore-green)' : isPlanned ? 'var(--amber)' : 'var(--outline)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {STATUS_LABELS[status] || status} · {PHASE_LABELS[currentPhase] || currentPhase}
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '2px' }}>{strain || species || 'Unknown'}</h2>
          <p style={{ fontSize: '12px', color: 'var(--outline)' }}>{species}</p>
        </div>
        {startDate && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '2px' }}>START DATE</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--on-surface)' }}>{new Date(startDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid var(--outline-variant)' }}>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '2px' }}>Recipe</span>
          <span style={{ fontSize: '13px', color: 'var(--on-surface)' }}>{Recipe?.name || '—'}</span>
        </div>
        <div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '2px' }}>End Date</span>
          <span style={{ fontSize: '13px', color: 'var(--on-surface)' }}>{endDate ? new Date(endDate).toLocaleDateString() : '—'}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {(isActive || status === 'COMPLETED') && (
          <Link to={`/cultivation/cycles/${cycle.id}/bioactives`} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '10px' }}>
            BIOACTIVES
          </Link>
        )}
        {isActive && (
          <button onClick={() => handleUpdate({ status: 'COMPLETED' })} className="btn btn-glow" style={{ flex: 1, fontSize: '10px' }}>
            COMPLETE
          </button>
        )}
        {isPlanned && (
          <button onClick={() => handleUpdate({ status: 'ACTIVE' })} className="btn btn-glow" style={{ flex: 1, fontSize: '10px' }}>
            START
          </button>
        )}
        {(isActive || isPlanned) && (
          <button onClick={() => handleUpdate({ status: 'ABORTED' })} className="btn btn-danger" style={{ flex: 1, fontSize: '10px' }}>
            ABORT
          </button>
        )}
      </div>
    </div>
  )
}

function Cycles() {
  const [cycles, setCycles] = useState([])
  const [recipes, setRecipes] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ recipeId: '', species: '', strain: '', startDate: '', deviceId: '' })
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    try {
      setError(null)
      const [c, r, d] = await Promise.all([getCycles(), getRecipes(), getDevices()])
      setCycles(c)
      setRecipes(r)
      setDevices(d)
    } catch (err) {
      setError(err.message || 'Error loading cycles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createCycle({
        recipeId: parseInt(form.recipeId, 10), species: form.species, strain: form.strain || undefined,
        startDate: form.startDate || undefined, deviceId: form.deviceId ? parseInt(form.deviceId, 10) : undefined,
      })
      setShowForm(false)
      setForm({ recipeId: '', species: '', strain: '', startDate: '', deviceId: '' })
      await load()
    } catch (err) {
      setError(err.message || 'Error creating cycle')
    } finally {
      setSubmitting(false)
    }
  }

  const active = cycles.filter(c => c.status === 'ACTIVE' || c.status === 'PLANNED')
  const historical = cycles.filter(c => c.status === 'COMPLETED' || c.status === 'ABORTED')

  if (loading) return <LoadingState message="Loading cycles..." icon="cyclone" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Cultivation Cycles</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--outline)' }}>
            {cycles.length} cycle{cycles.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-glow" style={{ fontSize: '11px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
          NEW CYCLE
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
          <span style={{ fontSize: '12px', color: 'var(--error-red)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* Active Cycles */}
      {active.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '16px' }}>Active</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '16px' }}>
            {active.map(c => <CycleCard key={c.id} cycle={c} onUpdate={load} />)}
          </div>
        </section>
      )}

      {/* Empty State */}
      {cycles.length === 0 && !error && (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '16px', display: 'block' }}>cyclone</span>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>No Cycles</h3>
          <p style={{ fontSize: '13px', color: 'var(--outline)', marginBottom: '24px' }}>
            No cultivation cycles yet. Start a new batch to begin tracking growth.
          </p>
        </div>
      )}

      {/* History Table */}
      {historical.length > 0 && (
        <section>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '16px' }}>History</h3>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Start</th>
                  <th>Species</th>
                  <th>Status</th>
                  <th>Phase</th>
                  <th>Recipe</th>
                  <th>End Date</th>
                </tr>
              </thead>
              <tbody>
                {historical.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--on-surface)' }}>{c.species || 'Unknown'}</span>
                      {c.strain && <span style={{ fontSize: '9px', color: 'var(--outline)', display: 'block' }}>Strain: {c.strain}</span>}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                        border: `1px solid ${c.status === 'ABORTED' ? 'rgba(239,68,68,0.3)' : 'rgba(var(--spore-green-rgb),0.3)'}`,
                        background: c.status === 'ABORTED' ? 'rgba(239,68,68,0.1)' : 'rgba(var(--spore-green-rgb),0.1)',
                        color: c.status === 'ABORTED' ? 'var(--error-red)' : 'var(--spore-green)',
                      }}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--on-surface-variant)' }}>
                      {PHASE_LABELS[c.currentPhase] || c.currentPhase}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--on-surface)' }}>{c.Recipe?.name || '—'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--on-surface-variant)' }}>
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>New Cycle</h2>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Recipe</label>
                <select value={form.recipeId} onChange={e => setForm({...form, recipeId: e.target.value})} required className="form-select">
                  <option value="">— Select Recipe —</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.species})</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Device / Chamber</label>
                <select value={form.deviceId} onChange={e => setForm({...form, deviceId: e.target.value})} className="form-select">
                  <option value="">— No device (manual) —</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.chamberName || d.deviceId}{d.chamberId != null ? ` (Chamber ${d.chamberId})` : ''} {d.macAddress ? `· ${d.macAddress}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Species</label>
                <input value={form.species} onChange={e => setForm({...form, species: e.target.value})} required className="form-input" />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Strain</label>
                <input value={form.strain} onChange={e => setForm({...form, strain: e.target.value})} className="form-input" />
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required className="form-input" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--outline-variant)' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary" style={{ fontSize: '11px' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-glow" style={{ fontSize: '11px' }}>{submitting ? 'Creating...' : 'Create Cycle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cycles
