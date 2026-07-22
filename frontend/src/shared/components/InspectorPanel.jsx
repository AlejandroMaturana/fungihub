function InspectorPanel({ open, onClose, title, subtitle, children, footer }) {
  if (!open) return null

  return (
    <>
      <div className="inspector-overlay" onClick={onClose} />
      <div className="inspector-panel">
        <div className="inspector-header">
          <div className="inspector-header-text">
            <h3 className="inspector-title">{title}</h3>
            {subtitle && <p className="inspector-subtitle">{subtitle}</p>}
          </div>
          <button className="btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="inspector-body">
          {children}
        </div>
        {footer && (
          <div className="inspector-footer">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}

export default InspectorPanel
