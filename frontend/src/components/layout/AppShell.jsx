import Sidebar from './Sidebar'
import TopBar from './TopBar'
import BottomNav from './BottomNav'
import StatusFooter from './StatusFooter'
import OfflineBanner from '../ui/OfflineBanner.jsx'

function AppShell({ user, onLogout, children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <TopBar user={user} onLogout={onLogout} />
      <main className="app-content">
        <OfflineBanner />
        {children}
      </main>
      <BottomNav />
      <StatusFooter />
    </div>
  )
}

export default AppShell
