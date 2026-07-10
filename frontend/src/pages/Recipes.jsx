import { useState, useEffect } from 'react'
import { getRecipes, createRecipe } from '../api/client.js'
import LoadingState from '../components/ui/LoadingState.jsx'
import RecipesEmptyState from '../components/ui/RecipesEmptyState.jsx'

const SPECIES_PRESETS = [
  {
    id: 'lions-mane',
    name: "Lion's Mane",
    species: 'Hericium erinaceus',
    icon: 'emoji_emotions',
    color: 'text-tertiary',
    incubation: { tempMin: 21, tempMax: 24, humMin: 85, humMax: 95, co2Max: 1200, days: 14 },
    fruiting: { tempMin: 18, tempMax: 22, humMin: 85, humMax: 95, co2Max: 600, days: 10 },
    fae: { interval: 60, strategy: 'TIMER', level: 'MEDIUM' },
    light: 12,
  },
  {
    id: 'blue-oyster',
    name: 'Blue Oyster',
    species: 'Pleurotus ostreatus',
    icon: 'water_drop',
    color: 'text-blue-400',
    incubation: { tempMin: 22, tempMax: 26, humMin: 85, humMax: 95, co2Max: 1200, days: 10 },
    fruiting: { tempMin: 15, tempMax: 20, humMin: 85, humMax: 95, co2Max: 600, days: 7 },
    fae: { interval: 45, strategy: 'TIMER', level: 'HIGH' },
    light: 12,
  },
  {
    id: 'pink-oyster',
    name: 'Pink Oyster',
    species: 'Pleurotus djamor',
    icon: 'water_drop',
    color: 'text-pink-400',
    incubation: { tempMin: 24, tempMax: 28, humMin: 85, humMax: 95, co2Max: 1200, days: 8 },
    fruiting: { tempMin: 20, tempMax: 25, humMin: 85, humMax: 95, co2Max: 600, days: 5 },
    fae: { interval: 45, strategy: 'TIMER', level: 'HIGH' },
    light: 12,
  },
  {
    id: 'shiitake',
    name: 'Shiitake',
    species: 'Lentinula edodes',
    icon: 'forest',
    color: 'text-amber-600',
    incubation: { tempMin: 22, tempMax: 26, humMin: 80, humMax: 90, co2Max: 1500, days: 14 },
    fruiting: { tempMin: 15, tempMax: 20, humMin: 80, humMax: 90, co2Max: 800, days: 10 },
    fae: { interval: 60, strategy: 'TIMER', level: 'MEDIUM' },
    light: 12,
  },
  {
    id: 'reishi',
    name: 'Reishi',
    species: 'Ganoderma lucidum',
    icon: 'spa',
    color: 'text-red-400',
    incubation: { tempMin: 26, tempMax: 30, humMin: 85, humMax: 95, co2Max: 1200, days: 14 },
    fruiting: { tempMin: 22, tempMax: 26, humMin: 85, humMax: 95, co2Max: 600, days: 21 },
    fae: { interval: 90, strategy: 'CO2_TRIGGER', level: 'LOW' },
    light: 12,
  },
  {
    id: 'king-oyster',
    name: 'King Oyster',
    species: 'Pleurotus eryngii',
    icon: 'yard',
    color: 'text-yellow-600',
    incubation: { tempMin: 22, tempMax: 25, humMin: 85, humMax: 95, co2Max: 1200, days: 14 },
    fruiting: { tempMin: 15, tempMax: 18, humMin: 80, humMax: 90, co2Max: 600, days: 10 },
    fae: { interval: 60, strategy: 'TIMER', level: 'MEDIUM' },
    light: 14,
  },
]

function TempRange({ min, max, label, idealMin, idealMax }) {
  const toPercent = (v) => Math.min(100, Math.max(0, ((v - 10) / 30) * 100))
  const left = toPercent(idealMin || min)
  const width = toPercent(idealMax || max) - left
  return (
    <div className="relative h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
      <div
        className="absolute top-0 h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500 opacity-20"
        style={{ left: '0%', width: '100%' }}
      />
      <div
        className="absolute top-0 h-full rounded-full bg-primary"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  )
}

function HumRange({ min, max, label }) {
  const left = Math.max(0, min)
  const width = Math.min(100, max) - left
  return (
    <div className="relative h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
      <div className="absolute top-0 h-full rounded-full bg-blue-400 opacity-20" />
      <div
        className="absolute top-0 h-full rounded-full bg-blue-400"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  )
}

function PhaseTimeline({ incubationDays, fruitingDays }) {
  const total = (incubationDays || 0) + (fruitingDays || 0)
  if (total === 0) return null
  const incPct = Math.round(((incubationDays || 0) / total) * 100)
  return (
    <div className="space-y-1">
      <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
        <div className="bg-primary rounded-l-full" style={{ width: `${incPct}%` }} />
        <div className="bg-secondary rounded-r-full flex-1" />
      </div>
      <div className="flex justify-between text-7px text-on-surface-variant">
        <span>Inc {incubationDays || 0}d</span>
        <span>Frt {fruitingDays || 0}d</span>
        <span className="font-semibold text-on-surface">{total}d</span>
      </div>
    </div>
  )
}

function PhaseSection({ title, icon, iconColor, phase, data, onChange }) {
  return (
    <div className="border border-outline-variant rounded-lg p-3 bg-surface-container-low space-y-3">
      <div className="flex items-center gap-2">
        <span className={`material-symbols-outlined text-16px ${iconColor}`}>{icon}</span>
        <h4 className="font-label-caps text-label-caps text-on-surface-variant">{title}</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="font-label-caps text-8px text-on-surface-variant block">Temp °C</label>
          <div className="flex gap-1">
            <input type="number" step="0.5" value={data.tempMin} onChange={e => onChange({ ...data, tempMin: e.target.value })}
              placeholder="Min" className="w-1/2 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
            <input type="number" step="0.5" value={data.tempMax} onChange={e => onChange({ ...data, tempMax: e.target.value })}
              placeholder="Max" className="w-1/2 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
          </div>
          {data.tempMin && data.tempMax && (
            <TempRange min={data.tempMin} max={data.tempMax} label={`${data.tempMin}–${data.tempMax}°C`} />
          )}
        </div>

        <div className="space-y-1">
          <label className="font-label-caps text-8px text-on-surface-variant block">Humidity %</label>
          <div className="flex gap-1">
            <input type="number" step="0.5" value={data.humMin} onChange={e => onChange({ ...data, humMin: e.target.value })}
              placeholder="Min" className="w-1/2 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
            <input type="number" step="0.5" value={data.humMax} onChange={e => onChange({ ...data, humMax: e.target.value })}
              placeholder="Max" className="w-1/2 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
          </div>
          {data.humMin && data.humMax && (
            <HumRange min={data.humMin} max={data.humMax} label={`${data.humMin}–${data.humMax}%`} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">CO₂ Max</label>
          <input type="number" value={data.co2Max} onChange={e => onChange({ ...data, co2Max: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">Days</label>
          <input type="number" value={data.days} onChange={e => onChange({ ...data, days: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
        </div>
      </div>
    </div>
  )
}

function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [form, setForm] = useState({
    name: '', species: '',
    incubation: { tempMin: '', tempMax: '', humMin: '', humMax: '', co2Max: 1200, days: '' },
    fruiting: { tempMin: '', tempMax: '', humMin: '', humMax: '', co2Max: 800, days: '' },
    faeInterval: 60, ventilationStrategy: 'TIMER', faeLevel: 'MEDIUM',
    lightCycle: 12,
  })

  async function load() {
    try {
      setError(null)
      const data = await getRecipes()
      setRecipes(data)
    } catch (err) {
      setError(err.message || 'Error loading recipes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function applyPreset(preset) {
    setSelectedPreset(preset.id)
    setForm({
      name: preset.name,
      species: preset.species,
      incubation: {
        tempMin: preset.incubation.tempMin,
        tempMax: preset.incubation.tempMax,
        humMin: preset.incubation.humMin,
        humMax: preset.incubation.humMax,
        co2Max: preset.incubation.co2Max,
        days: preset.incubation.days,
      },
      fruiting: {
        tempMin: preset.fruiting.tempMin,
        tempMax: preset.fruiting.tempMax,
        humMin: preset.fruiting.humMin,
        humMax: preset.fruiting.humMax,
        co2Max: preset.fruiting.co2Max,
        days: preset.fruiting.days,
      },
      faeInterval: preset.fae.interval,
      ventilationStrategy: preset.fae.strategy,
      faeLevel: preset.fae.level,
      lightCycle: preset.light,
    })
  }

  function resetForm() {
    setSelectedPreset(null)
    setForm({
      name: '', species: '',
      incubation: { tempMin: '', tempMax: '', humMin: '', humMax: '', co2Max: 1200, days: '' },
      fruiting: { tempMin: '', tempMax: '', humMin: '', humMax: '', co2Max: 800, days: '' },
      faeInterval: 60, ventilationStrategy: 'TIMER', faeLevel: 'MEDIUM',
      lightCycle: 12,
    })
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createRecipe({
        name: form.name,
        species: form.species,
        incubationTempMin: parseFloat(form.incubation.tempMin) || null,
        incubationTempMax: parseFloat(form.incubation.tempMax) || null,
        incubationHumMin: parseFloat(form.incubation.humMin) || null,
        incubationHumMax: parseFloat(form.incubation.humMax) || null,
        incubationCo2Max: parseInt(form.incubation.co2Max) || 1200,
        incubationDurationDays: parseInt(form.incubation.days) || null,
        fruitingTempMin: parseFloat(form.fruiting.tempMin) || null,
        fruitingTempMax: parseFloat(form.fruiting.tempMax) || null,
        fruitingHumMin: parseFloat(form.fruiting.humMin) || null,
        fruitingHumMax: parseFloat(form.fruiting.humMax) || null,
        fruitingCo2Max: parseInt(form.fruiting.co2Max) || 800,
        fruitingDurationDays: parseInt(form.fruiting.days) || null,
        faeIntervalMinutes: parseInt(form.faeInterval) || 60,
        ventilationStrategy: form.ventilationStrategy,
        faeLevel: form.faeLevel,
        lightCycleHours: parseInt(form.lightCycle) || 12,
      })
      setShowForm(false)
      resetForm()
      await load()
    } catch (err) {
      setError(err.message || 'Error creating recipe')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState message="Loading recipes..." icon="science" />

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-end pb-4 mb-4 border-b border-outline-variant/30">
        <div>
          <h1 className="text-headline-lg text-on-surface">Recipes</h1>
          <p className="text-body-md text-on-surface-variant">{recipes.length} recipe{recipes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn btn-primary">
          <span className="material-symbols-outlined text-16px">add</span>
          NEW RECIPE
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-error-container/10 border border-error/40 flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-18px">warning</span>
          <span className="text-data-sm text-error font-semibold">{error}</span>
        </div>
      )}

      {recipes.length === 0 ? (
        <RecipesEmptyState onCreate={() => { resetForm(); setShowForm(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {recipes.map(r => {
            const totalDays = (r.incubationDurationDays || 0) + (r.fruitingDurationDays || 0)
            return (
              <div key={r.id} className="glass-card p-4 rounded-xl border border-outline-variant hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-body-lg text-primary font-semibold">{r.name}</h3>
                    <p className="text-body-sm text-on-surface-variant italic">{r.species}</p>
                  </div>
                  <span className="font-mono text-data-sm text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                    {totalDays || '?'}d
                  </span>
                </div>
                <PhaseTimeline incubationDays={r.incubationDurationDays} fruitingDays={r.fruitingDurationDays} />
                <div className="grid grid-cols-2 gap-2 mt-3 text-8px">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-10px text-blue-400">thermostat</span>
                    <span className="text-on-surface-variant">Inc: {r.incubationTempMin || '?'}–{r.incubationTempMax || '?'}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-10px text-blue-400">thermostat</span>
                    <span className="text-on-surface-variant">Frut: {r.fruitingTempMin || '?'}–{r.fruitingTempMax || '?'}°C</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-10px text-cyan-400">water_drop</span>
                    <span className="text-on-surface-variant">Inc: {r.incubationHumMin || '?'}–{r.incubationHumMax || '?'}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-10px text-cyan-400">water_drop</span>
                    <span className="text-on-surface-variant">Frut: {r.fruitingHumMin || '?'}–{r.fruitingHumMax || '?'}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-10px text-green-400">air</span>
                    <span className="text-on-surface-variant">FAE: {r.faeIntervalMinutes || '?'}min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-10px text-amber-400">light_mode</span>
                    <span className="text-on-surface-variant">Light: {r.lightCycleHours || 12}h</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'color-mix(in srgb, var(--surface-dim) 85%, transparent)', backdropFilter: 'blur(4px)' }}>
          <div className="relative bg-surface border border-outline-variant rounded-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

            <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-title-lg text-on-surface">New Recipe</h2>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost">
                <span className="material-symbols-outlined text-20px">close</span>
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-5 py-3 space-y-4">

              <section>
                <h3 className="font-label-caps text-label-caps text-secondary mb-2">Quick Start — Species Preset</h3>
                <div className="grid grid-cols-4 gap-1.5">
                  {SPECIES_PRESETS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                        selectedPreset === p.id
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-outline-variant hover:border-primary/40 bg-surface-container-low'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-18px ${p.color}`}>{p.icon}</span>
                      <span className="text-7px text-on-surface font-medium text-center leading-tight">{p.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="font-label-caps text-label-caps text-secondary mb-2">Identity</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">Name</label>
                    <input
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-body-sm focus:outline-none focus:border-primary"
                      placeholder="e.g. Lion's Mane Standard"
                    />
                  </div>
                  <div>
                    <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">Species</label>
                    <input
                      value={form.species}
                      onChange={e => setForm({ ...form, species: e.target.value })}
                      required
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-body-sm italic focus:outline-none focus:border-primary"
                      placeholder="Hericium erinaceus"
                    />
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <PhaseSection
                  title="Incubation"
                  icon="science"
                  iconColor="text-primary"
                  phase="incubation"
                  data={form.incubation}
                  onChange={d => setForm({ ...form, incubation: d })}
                />
                <PhaseSection
                  title="Fruiting"
                  icon="grass"
                  iconColor="text-secondary"
                  phase="fruiting"
                  data={form.fruiting}
                  onChange={d => setForm({ ...form, fruiting: d })}
                />
              </div>

              <section>
                <h3 className="font-label-caps text-label-caps text-secondary mb-2">Environment</h3>
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">FAE (min)</label>
                    <input type="number" value={form.faeInterval} onChange={e => setForm({ ...form, faeInterval: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
                  </div>
                  <div>
                    <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">Ventilation</label>
                    <select value={form.ventilationStrategy} onChange={e => setForm({ ...form, ventilationStrategy: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-data-sm focus:outline-none focus:border-primary cursor-pointer">
                      <option value="TIMER">Timer</option>
                      <option value="CO2_TRIGGER">CO₂</option>
                      <option value="HYBRID">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">FAE Level</label>
                    <select value={form.faeLevel} onChange={e => setForm({ ...form, faeLevel: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-data-sm focus:outline-none focus:border-primary cursor-pointer">
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-label-caps text-8px text-on-surface-variant block mb-0.5">Light (h)</label>
                    <input type="number" min="0" max="24" value={form.lightCycle} onChange={e => setForm({ ...form, lightCycle: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-data-sm text-center font-mono focus:outline-none focus:border-primary" />
                  </div>
                </div>
              </section>

              <div className="flex justify-between items-center pt-2 pb-3 border-t border-outline-variant/30">
                <button type="button" onClick={resetForm} className="text-body-sm text-on-surface-variant hover:text-error transition-colors">
                  Reset
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary">
                    {submitting ? '...' : 'Create'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Recipes
