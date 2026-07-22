import { Outlet } from 'react-router-dom'
import SettingsNav from '../components/SettingsNav.jsx'

function Settings() {
  return (
    <div className="flex gap-6 max-w-[1800px] mx-auto">
      <aside className="hidden lg:flex flex-col w-56 shrink-0">
        <SettingsNav />
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default Settings
