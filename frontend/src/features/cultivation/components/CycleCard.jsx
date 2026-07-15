import { Link } from 'react-router-dom'
import StatusBadge from '../../../shared/components/StatusBadge'

const PHASE_LABELS = {
  INCUBATION: 'Incubation',
  FRUITING: 'Fruiting',
  MAINTENANCE: 'Maintenance',
  COMPLETED: 'Completed',
}

function CycleCard({ cycle }) {
  const isActive = cycle.status === 'ACTIVE'
  const progress = cycle.progress || 0

  return (
    <Link to={`/cycles/${cycle.id}/bioactives`} className="glass-card rounded-lg p-4 block hover:border-primary/30 transition-all">
      <div className="flex items-center justify-between mb-2">
        <span className="text-body-md text-on-surface font-medium">{cycle.name || `Cycle ${cycle.id}`}</span>
        <StatusBadge status={cycle.status?.toLowerCase()} label={cycle.status} />
      </div>
      <div className="text-8px text-on-surface-variant mb-2">
        {cycle.Recipe?.name || 'No recipe'} · {PHASE_LABELS[cycle.currentPhase] || cycle.currentPhase}
      </div>
      {isActive && (
        <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
      <div className="flex items-center justify-between mt-2 text-8px text-on-surface-variant">
        <span>{cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : 'Not started'}</span>
        {cycle.endDate && <span>End: {new Date(cycle.endDate).toLocaleDateString()}</span>}
      </div>
    </Link>
  )
}

export default CycleCard
