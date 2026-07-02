function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state">
      <span className="material-symbols-outlined text-[36px] text-error mb-2">error</span>
      <p className="text-body-md text-error font-semibold">{message || 'Error inesperado'}</p>
      {onRetry && (
        <button className="mt-3 px-5 py-2 bg-error/20 border border-error/40 text-error font-label-caps text-label-caps rounded-md hover:bg-error/30 transition-all" onClick={onRetry}>
          REINTENTAR
        </button>
      )}
    </div>
  )
}

export default ErrorState
