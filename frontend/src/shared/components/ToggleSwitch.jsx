function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <div
      className={`toggle-switch ${checked ? 'on' : 'off'}${disabled ? ' opacity-50 cursor-not-allowed' : ''}`}
      onClick={disabled ? undefined : () => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!disabled) onChange(!checked) } }}
    >
      <div className="toggle-knob" />
    </div>
  )
}

export default ToggleSwitch
