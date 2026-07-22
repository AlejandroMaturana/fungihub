function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="empty-state">
      {icon && <span className="material-symbols-outlined empty-state-icon">{icon}</span>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {message && <p className="empty-state-message">{message}</p>}
      {action && (
        <button className="btn btn-primary empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
