export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line skeleton-line-title" />
      <div className="skeleton-line skeleton-line-text" />
      <div className="skeleton-line skeleton-line-text short" />
    </div>
  )
}

export function SkeletonGrid({ count = 4 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

export function SkeletonMetric() {
  return (
    <div className="skeleton-metric">
      <div className="skeleton-line skeleton-line-value" />
      <div className="skeleton-line skeleton-line-label" />
    </div>
  )
}

export function SkeletonTable({ rows = 3, cols = 4 }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="skeleton-row">
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className="skeleton-line skeleton-line-cell" />
          ))}
        </div>
      ))}
    </div>
  )
}
