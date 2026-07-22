function DashboardGrid({ children, columns = 'auto', gap = 'md', className = '' }) {
  const classes = [
    'dashboard-grid',
    `dashboard-grid-gap-${gap}`,
    className
  ].filter(Boolean).join(' ')

  const style = columns !== 'auto'
    ? { gridTemplateColumns: `repeat(${columns}, 1fr)` }
    : {}

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  )
}

export default DashboardGrid
