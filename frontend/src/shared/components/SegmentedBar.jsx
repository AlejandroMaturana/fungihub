function SegmentedBar({ active = 0, total = 20, color = 'primary' }) {
  const segments = Array.from({ length: total }, (_, i) => i < active)

  return (
    <div className="segmented-bar">
      {segments.map((filled, i) => (
        <div key={i} className={`segment${filled ? ` active-${color}` : ''}`} />
      ))}
    </div>
  )
}

export default SegmentedBar
