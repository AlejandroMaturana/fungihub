function EmptyState({ icon = 'inbox', title, message, action }) {
  return (
    <div className="empty-state">
      {icon && <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">{icon}</span>}
      {title && <h3 className="text-headline-md text-on-surface mb-2">{title}</h3>}
      {message && <p className="text-body-md text-on-surface-variant">{message}</p>}
      {action && (
        <button className="mt-4 px-6 py-2 bg-primary text-on-primary font-label-caps text-label-caps rounded-md hover:brightness-110 transition-all" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
