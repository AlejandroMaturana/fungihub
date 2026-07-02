function StatusBadge({ status = 'online', label, pulse = true }) {
  return (
    <span className={`status-badge ${status}`}>
      <span className={`status-dot ${status}${pulse ? ' pulse' : ''}`} />
      {label || status}
    </span>
  )
}

export default StatusBadge
