function FilterBar({ children, onSubmit }) {
  return (
    <form className="filter-bar" onSubmit={(e) => { e.preventDefault(); onSubmit?.() }}>
      {children}
    </form>
  )
}

function FilterField({ label, children }) {
  return (
    <div className="filter-field">
      <label>{label}</label>
      {children}
    </div>
  )
}

FilterBar.Field = FilterField

export default FilterBar
