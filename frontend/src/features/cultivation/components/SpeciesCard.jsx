const DIFFICULTY = {
  BEGINNER: { label: 'Principiante', color: 'text-green-400', icon: 'signal_1' },
  INTERMEDIATE: { label: 'Intermedio', color: 'text-amber-500', icon: 'signal_2' },
  ADVANCED: { label: 'Avanzado', color: 'text-error', icon: 'signal_3' },
}

const ADAPTER_CLASS = {
  ADAPTOGEN: { label: 'Adaptógeno', color: 'text-purple-400' },
  EDIBLE: { label: 'Comestible', color: 'text-green-400' },
  MEDICINAL: { label: 'Medicinal', color: 'text-blue-400' },
}

function SpeciesCard({ species, onClick }) {
  const diff = DIFFICULTY[species.difficulty] || DIFFICULTY.BEGINNER
  const adapter = ADAPTER_CLASS[species.adapterClass] || ADAPTER_CLASS.EDIBLE

  return (
    <button
      onClick={onClick}
      className="glass-card rounded-lg p-4 text-left hover:border-primary/30 transition-all w-full"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary text-18px">biotech</span>
        <span className="text-body-md text-on-surface font-medium">{species.commonName}</span>
      </div>
      <div className="text-8px text-on-surface-variant italic mb-2">{species.scientificName}</div>
      <div className="flex items-center gap-2 text-8px">
        <span className={diff.color}>{diff.label}</span>
        <span className="text-outline">·</span>
        <span className={adapter.color}>{adapter.label}</span>
      </div>
      {species.optimalTemp && (
        <div className="mt-2 text-8px text-on-surface-variant font-mono">
          {species.optimalTemp}°C · {species.optimalHumidity}%RH
        </div>
      )}
    </button>
  )
}

export default SpeciesCard
