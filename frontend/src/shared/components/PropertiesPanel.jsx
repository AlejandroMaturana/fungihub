function PropertiesPanel({ title, properties }) {
  return (
    <div className="properties-panel">
      {title && (
        <h5 className="properties-panel-title">{title}</h5>
      )}
      <div className="properties-grid">
        {properties.map((prop, idx) => (
          <div key={idx} className="property-item">
            {prop.icon && (
              <span className="material-symbols-outlined property-icon">{prop.icon}</span>
            )}
            <div className="property-content">
              <span className="property-label">{prop.label}</span>
              <span className="property-value">{prop.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PropertiesPanel
