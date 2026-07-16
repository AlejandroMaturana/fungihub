import { useState, useEffect } from 'react'
import { getSpecies, getSpeciesById, getRecipes } from '../api/client.js'
import LoadingState from '../components/ui/LoadingState.jsx'

const DIFFICULTY_LABELS = {
  BEGINNER: { label: 'Principiante', color: '#4ade80', icon: 'signal_1' },
  INTERMEDIATE: { label: 'Intermedio', color: '#fbbf24', icon: 'signal_2' },
  ADVANCED: { label: 'Avanzado', color: '#f87171', icon: 'signal_3' },
}

const CLASS_LABELS = {
  ADAPTOGEN: { label: 'Adaptógeno', color: '#a78bfa' },
  EDIBLE: { label: 'Comestible', color: '#4ade80' },
  MEDICINAL: { label: 'Medicinal', color: '#60a5fa' },
}

function CompoundsBadges({ compounds }) {
  if (!compounds || typeof compounds !== 'object') return null
  const entries = Object.entries(compounds).filter(([, v]) => v)
  if (entries.length === 0) return null
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {entries.map(([key, val]) => {
        const label = typeof val === 'boolean' ? key.replace(/([A-Z])/g, ' $1').trim() : `${key.replace(/([A-Z])/g, ' $1').trim()}: ${val}`
        return (
          <span key={key} style={{ padding: '2px 6px', background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple, #8b5cf6)', fontSize: '9px', borderRadius: '9999px', fontWeight: 600 }}>{label}</span>
        )
      })}
    </div>
  )
}

function SpeciesLibrary() {
  const [species, setSpecies] = useState([])
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSpecies, setSelectedSpecies] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [filters, setFilters] = useState({ adapterClass: '', difficultyLevel: '' })

  async function load() {
    try {
      setError(null)
      const params = {}
      if (filters.adapterClass) params.adapterClass = filters.adapterClass
      if (filters.difficultyLevel) params.difficultyLevel = filters.difficultyLevel
      const [s, r] = await Promise.all([getSpecies(params), getRecipes()])
      setSpecies(s)
      setRecipes(r)
    } catch (err) {
      setError(err.message || 'Error loading species')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filters])

  async function handleSelect(sp) {
    setDetailLoading(true)
    try {
      const detail = await getSpeciesById(sp.id)
      setSelectedSpecies(detail)
    } catch (err) {
      setError(err.message || 'Error loading species detail')
    } finally {
      setDetailLoading(false)
    }
  }

  function getRecipesForSpecies(speciesId) {
    return recipes.filter(r => r.speciesId === speciesId)
  }

  if (loading) return <LoadingState message="Loading species library..." icon="potted_plant" />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="gradient-title" style={{ fontSize: '28px', marginBottom: '4px' }}>Species Library</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--outline)' }}>
            {species.length} species
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={filters.adapterClass} onChange={e => setFilters({ ...filters, adapterClass: e.target.value })} className="form-select" style={{ fontSize: '11px' }}>
            <option value="">All classes</option>
            <option value="ADAPTOGEN">Adaptógeno</option>
            <option value="EDIBLE">Comestible</option>
            <option value="MEDICINAL">Medicinal</option>
          </select>
          <select value={filters.difficultyLevel} onChange={e => setFilters({ ...filters, difficultyLevel: e.target.value })} className="form-select" style={{ fontSize: '11px' }}>
            <option value="">All levels</option>
            <option value="BEGINNER">Principiante</option>
            <option value="INTERMEDIATE">Intermedio</option>
            <option value="ADVANCED">Avanzado</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--error-red)' }}>warning</span>
          <span style={{ fontSize: '12px', color: 'var(--error-red)', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {/* Species Cards */}
      {species.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--outline)', marginBottom: '16px', display: 'block' }}>potted_plant</span>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '8px' }}>No species found</h3>
          <p style={{ fontSize: '13px', color: 'var(--outline)' }}>Run the seed script to populate the species library.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {species.map(sp => {
            const classInfo = CLASS_LABELS[sp.adapterClass] || {}
            const diffInfo = DIFFICULTY_LABELS[sp.difficultyLevel] || {}
            const recipeCount = getRecipesForSpecies(sp.id).length
            return (
              <button
                key={sp.id}
                onClick={() => handleSelect(sp)}
                className="glass-card"
                style={{
                  padding: '16px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                  borderColor: selectedSpecies?.id === sp.id ? 'var(--spore-green)' : undefined,
                  boxShadow: selectedSpecies?.id === sp.id ? 'var(--glow-primary)' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--outline)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.scientificName}</p>
                  </div>
                  {diffInfo.icon && (
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: diffInfo.color }}>{diffInfo.icon}</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 600, background: `${classInfo.color}20`, color: classInfo.color }}>
                    {classInfo.label || sp.adapterClass}
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: 600, color: diffInfo.color }}>
                    {diffInfo.label || sp.difficultyLevel}
                  </span>
                  {sp.originClimate && (
                    <span style={{ fontSize: '9px', color: 'var(--outline)' }}>• {sp.originClimate}</span>
                  )}
                </div>

                {sp.description && (
                  <p style={{ fontSize: '12px', color: 'var(--outline)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{sp.description}</p>
                )}

                <CompoundsBadges compounds={sp.compounds} />

                <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--outline)' }}>
                    {recipeCount} recipe{recipeCount !== 1 ? 's' : ''}
                  </span>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--outline)' }}>chevron_right</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Species Detail Modal */}
      {selectedSpecies && (
        <div className="modal-overlay" onClick={() => setSelectedSpecies(null)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--on-surface)' }}>{selectedSpecies.name}</h2>
                <p style={{ fontSize: '12px', color: 'var(--outline)', fontStyle: 'italic' }}>{selectedSpecies.scientificName}</p>
              </div>
              <button onClick={() => setSelectedSpecies(null)} className="btn btn-ghost btn-sm">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {detailLoading ? (
                <LoadingState message="Loading details..." icon="hourglass_empty" />
              ) : (
                <>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { label: 'Class', value: CLASS_LABELS[selectedSpecies.adapterClass]?.label || selectedSpecies.adapterClass, color: CLASS_LABELS[selectedSpecies.adapterClass]?.color },
                      { label: 'Difficulty', value: DIFFICULTY_LABELS[selectedSpecies.difficultyLevel]?.label || selectedSpecies.difficultyLevel, color: DIFFICULTY_LABELS[selectedSpecies.difficultyLevel]?.color },
                      { label: 'Climate', value: selectedSpecies.originClimate || '—' },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '2px' }}>{item.label}</span>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: item.color || 'var(--on-surface)' }}>{item.value}</span>
                      </div>
                    ))}
                  </div>

                  {selectedSpecies.description && (
                    <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{selectedSpecies.description}</p>
                  )}

                  <div>
                    <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>Compounds</h3>
                    <CompoundsBadges compounds={selectedSpecies.compounds} />
                  </div>

                  {getRecipesForSpecies(selectedSpecies.id).length > 0 && (
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '8px' }}>
                        Available Recipes ({getRecipesForSpecies(selectedSpecies.id).length})
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {getRecipesForSpecies(selectedSpecies.id).map(r => (
                          <div key={r.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--on-surface)' }}>{r.name}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '9px', color: 'var(--outline)', fontFamily: 'var(--font-mono)' }}>
                                <span>Inc: {r.incubationDurationDays}d</span>
                                <span>Frt: {r.fruitingDurationDays}d</span>
                                <span>CO₂: {r.fruitingCo2Max}ppm</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SpeciesLibrary
