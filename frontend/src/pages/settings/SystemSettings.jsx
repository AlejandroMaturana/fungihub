import { useTheme } from '../../contexts/ThemeContext.jsx'
import ToggleSwitch from '../../components/ui/ToggleSwitch.jsx'

function SystemSettings() {
  const { theme, isDark, toggleTheme } = useTheme()

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface mb-1">System Configuration</h1>
        <p className="text-on-surface-variant text-body-md">Theme, display and general preferences.</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-12 lg:col-span-5 glass-card p-5 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">palette</span>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">THEME & DISPLAY</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface">Dark Mode</span>
              <ToggleSwitch checked={isDark} onChange={toggleTheme} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface">Ambient Animations</span>
              <ToggleSwitch checked={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-md text-on-surface">Compact UI</span>
              <ToggleSwitch checked={false} onChange={() => {}} />
            </div>
            <div>
              <p className="font-label-caps text-9px text-on-surface-variant mb-1">GLOW INTENSITY</p>
              <div className="flex items-center gap-3">
                <input type="range" min="0" max="100" defaultValue="72" className="flex-1 h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary" />
                <span className="font-mono text-data-sm text-secondary w-10 text-right">72%</span>
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-12 lg:col-span-7 glass-card p-5 rounded-xl border border-outline-variant">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-secondary">language</span>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">PREFERENCES</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="font-label-caps text-9px text-on-surface-variant mb-1">LANGUAGE</p>
              <select className="w-full bg-surface-container-low border border-outline-variant rounded text-body-md text-on-surface px-3 py-2">
                <option>English (US)</option>
                <option>Español</option>
                <option>Français</option>
                <option>Deutsch</option>
              </select>
            </div>
            <div>
              <p className="font-label-caps text-9px text-on-surface-variant mb-1">TIMEZONE</p>
              <select className="w-full bg-surface-container-low border border-outline-variant rounded text-body-md text-on-surface px-3 py-2">
                <option>UTC (Universal)</option>
                <option>America/New_York (EST)</option>
                <option>Europe/London (GMT)</option>
                <option>Asia/Tokyo (JST)</option>
              </select>
            </div>
            <div>
              <p className="font-label-caps text-9px text-on-surface-variant mb-1">DATE FORMAT</p>
              <select className="w-full bg-surface-container-low border border-outline-variant rounded text-body-md text-on-surface px-3 py-2">
                <option>YYYY-MM-DD</option>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default SystemSettings
