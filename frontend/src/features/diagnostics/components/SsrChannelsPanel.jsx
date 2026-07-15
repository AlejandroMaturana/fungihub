function SsrChannelsPanel({ channels = [] }) {
  if (channels.length === 0) return null

  return (
    <div className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-primary text-18px">electrical_services</span>
        <span className="chart-panel-label">SSR CHANNELS</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {channels.map(ch => (
          <div key={ch.channel} className="p-3 bg-surface-container-low rounded-lg text-center">
            <div className="text-8px font-label-caps text-on-surface-variant mb-1">CH{ch.channel}</div>
            <div className={`text-body-sm font-mono ${ch.state === 'ON' ? 'text-primary' : 'text-on-surface-variant'}`}>
              {ch.state}
            </div>
            {ch.power != null && (
              <div className="text-8px text-on-surface-variant mt-0.5">{ch.power}%</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SsrChannelsPanel
