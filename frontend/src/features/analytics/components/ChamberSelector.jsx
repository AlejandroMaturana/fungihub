function ChamberSelector({ devices = [], selectedId, onSelect }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <button
        className={`btn btn-sm ${!selectedId ? 'btn-primary' : 'btn-outline'}`}
        onClick={() => onSelect(null)}
      >
        All Chambers
      </button>
      {devices.map(d => (
        <button
          key={d.id}
          className={`btn btn-sm ${selectedId === d.id ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onSelect(d.id)}
        >
          {d.chamberName || d.deviceId}
        </button>
      ))}
    </div>
  )
}

export default ChamberSelector
