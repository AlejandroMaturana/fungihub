import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getCycle, transitionCycle, abortCycle, getCycleTransitions } from '../../../api/client.js'
import LoadingState from '../../../shared/components/LoadingState.jsx'
import ErrorState from '../../../shared/components/ErrorState.jsx'
import EmptyState from '../../../shared/components/EmptyState.jsx'
import EntityHeader from '../../../shared/components/EntityHeader.jsx'
import Panel from '../../../shared/components/Panel.jsx'
import PropertiesPanel from '../../../shared/components/PropertiesPanel.jsx'

const STATUS_LABELS = { PLANNED: 'Planned', ACTIVE: 'Active', COMPLETED: 'Completed', ABORTED: 'Aborted' }
const PHASE_LABELS = { INCUBATION: 'Incubation', FRUITING: 'Fruiting', MAINTENANCE: 'Maintenance', COMPLETED: 'Completed' }
const PHASE_ORDER = ['INCUBATION', 'FRUITING', 'MAINTENANCE', 'COMPLETED']
const STATUS_COLORS = {
  PLANNED: 'var(--amber)',
  ACTIVE: 'var(--spore-green)',
  COMPLETED: 'var(--outline)',
  ABORTED: 'var(--error-red)',
}

function CycleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cycle, setCycle] = useState(null)
  const [transitions, setTransitions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showAbortModal, setShowAbortModal] = useState(false)
  const [transitionNote, setTransitionNote] = useState('')

  async function load() {
    try {
      setError(null)
      const [c, t] = await Promise.all([getCycle(id), getCycleTransitions(id)])
      setCycle(c)
      setTransitions(t)
    } catch (err) {
      setError(err.message || 'Error loading cycle')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function handleTransition(toPhase) {
    setActionLoading(true)
    try {
      await transitionCycle(id, { toPhase, notes: transitionNote || `Manual transition to ${toPhase}` })
      setTransitionNote('')
      await load()
    } catch (err) {
      setError(err.message || 'Error transitioning cycle')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleAbort() {
    setActionLoading(true)
    try {
      await abortCycle(id)
      setShowAbortModal(false)
      await load()
    } catch (err) {
      setError(err.message || 'Error aborting cycle')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <LoadingState message="Loading cycle..." icon="cyclone" />
  if (error && !cycle) return <ErrorState message={error} onRetry={load} />
  if (!cycle) return <EmptyState icon="cyclone" title="Cycle not found" message="This cycle doesn't exist or has been removed." />

  const isActive = cycle.status === 'ACTIVE'
  const isPlanned = cycle.status === 'PLANNED'
  const isTerminal = cycle.status === 'COMPLETED' || cycle.status === 'ABORTED'
  const currentPhaseIdx = PHASE_ORDER.indexOf(cycle.currentPhase)

  const nextPhase = !isTerminal && currentPhaseIdx < PHASE_ORDER.length - 1 ? PHASE_ORDER[currentPhaseIdx + 1] : null

  const properties = [
    { icon: 'science', label: 'Recipe', value: cycle.Recipe?.name || '—' },
    { icon: 'memory', label: 'Device', value: cycle.Device?.chamberName || cycle.Device?.deviceId || '—' },
    { icon: 'calendar_today', label: 'Start Date', value: cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : '—' },
    { icon: 'event_busy', label: 'End Date', value: cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : '—' },
    { icon: 'category', label: 'Species', value: cycle.species || '—' },
    { icon: 'label', label: 'Strain', value: cycle.strain || '—' },
    { icon: 'schedule', label: 'Duration', value: cycle.startDate ? `${Math.ceil((new Date(cycle.endDate || Date.now()) - new Date(cycle.startDate)) / 86400000)} days` : '—' },
    { icon: 'flag', label: 'Status', value: STATUS_LABELS[cycle.status] || cycle.status, color: STATUS_COLORS[cycle.status] },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Link to="/cultivation/cycles" style={{ alignSelf: 'flex-start', fontSize: '11px', color: 'var(--outline)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
        BACK TO CYCLES
      </Link>

      <EntityHeader
        title={cycle.strain || cycle.species || 'Unnamed Cycle'}
        subtitle={cycle.species ? `Species: ${cycle.species}` : undefined}
        badge={`${STATUS_LABELS[cycle.status] || cycle.status} · ${PHASE_LABELS[cycle.currentPhase] || cycle.currentPhase}`}
        badgeVariant={isActive ? 'online' : isTerminal ? (cycle.status === 'ABORTED' ? 'critical' : 'default') : 'warning'}
      />

      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
          <span style={{ fontSize: '12px', color: 'var(--error-red)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      <PropertiesPanel title="Cycle Properties" properties={properties} />

      {/* Phase Progress */}
      <Panel title="Phase Progress" subtitle={`Current: ${PHASE_LABELS[cycle.currentPhase] || cycle.currentPhase}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {PHASE_ORDER.map((phase, i) => {
              const isPast = i < currentPhaseIdx
              const isCurrent = i === currentPhaseIdx
              const isFuture = i > currentPhaseIdx
              return (
                <div key={phase} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isPast ? 'var(--spore-green)' : isCurrent ? 'rgba(var(--spore-green-rgb), 0.2)' : 'var(--surface-container)',
                    border: `2px solid ${isPast || isCurrent ? 'var(--spore-green)' : 'var(--outline-variant)'}`,
                    transition: 'all 0.2s',
                  }}>
                    {isPast ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--spore-green)' }}>check</span>
                    ) : (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, color: isCurrent ? 'var(--spore-green)' : 'var(--outline)' }}>{i + 1}</span>
                    )}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: isCurrent ? 'var(--spore-green)' : isPast ? 'var(--on-surface)' : 'var(--outline)', fontWeight: isCurrent ? 700 : 400, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {PHASE_LABELS[phase]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </Panel>

      {/* Phase Management */}
      {!isTerminal && (
        <Panel title="Phase Management" subtitle="Control cycle transitions">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '4px' }}>Transition Note (optional)</label>
              <input value={transitionNote} onChange={e => setTransitionNote(e.target.value)} className="form-input" placeholder="e.g. Observing good pin formation..." style={{ fontSize: '12px' }} />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {nextPhase && (
                <button onClick={() => handleTransition(nextPhase)} disabled={actionLoading} className="btn btn-glow" style={{ fontSize: '11px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  {actionLoading ? 'Processing...' : `Transition to ${PHASE_LABELS[nextPhase]}`}
                </button>
              )}
              {isActive && (
                <button onClick={() => handleTransition('COMPLETED')} disabled={actionLoading} className="btn btn-secondary" style={{ fontSize: '11px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
                  {actionLoading ? 'Processing...' : 'Complete Cycle'}
                </button>
              )}
              <button onClick={() => setShowAbortModal(true)} disabled={actionLoading} className="btn btn-danger" style={{ fontSize: '11px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>cancel</span>
                ABORT
              </button>
            </div>
          </div>
        </Panel>
      )}

      {/* Bioactives Link */}
      {(isActive || cycle.status === 'COMPLETED') && (
        <Link to={`/cultivation/cycles/${id}/bioactives`} style={{ textDecoration: 'none' }}>
          <Panel title="Bioactive Analysis" subtitle="View compound correlation data">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--outline)' }}>View detailed bioactive measurements and correlation data for this cycle</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--spore-green)' }}>arrow_forward</span>
            </div>
          </Panel>
        </Link>
      )}

      {/* Transition History */}
      <Panel title="Transition History" subtitle={`${transitions.length} transition${transitions.length !== 1 ? 's' : ''}`}>
        {transitions.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', padding: '24px 0' }}>No transitions recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transitions.map((t, i) => (
              <div key={t.id || i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--spore-green)' }}>swap_horiz</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {PHASE_LABELS[t.fromPhase] || t.fromPhase} → {PHASE_LABELS[t.toPhase] || t.toPhase}
                  </span>
                  {t.notes && <span style={{ fontSize: '11px', color: 'var(--outline)', display: 'block', marginTop: '2px' }}>{t.notes}</span>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--outline)', textTransform: 'uppercase' }}>{t.triggerType || 'UNKNOWN'}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--on-surface-variant)', display: 'block' }}>
                    {t.createdAt ? new Date(t.createdAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {/* Abort Modal */}
      {showAbortModal && (
        <div className="modal-overlay" onClick={() => !actionLoading && setShowAbortModal(false)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--error-red)' }}>warning</span>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)', textAlign: 'center' }}>Abort Cycle</h2>
              <p style={{ fontSize: '13px', color: 'var(--outline)', textAlign: 'center', lineHeight: 1.5 }}>
                Are you sure you want to abort this cycle? This will turn off all actuators and mark the cycle as aborted.
              </p>
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '8px' }}>
                <button onClick={() => setShowAbortModal(false)} disabled={actionLoading} className="btn btn-secondary" style={{ flex: 1, fontSize: '12px' }}>Cancel</button>
                <button onClick={handleAbort} disabled={actionLoading} className="btn btn-danger" style={{ flex: 1, fontSize: '12px' }}>
                  {actionLoading ? 'Aborting...' : 'Abort Cycle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CycleDetail
