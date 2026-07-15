import Sidebar from '../Sidebar/Sidebar'
import TopBar from '../TopBar/TopBar'
import BottomNav from '../BottomNav/BottomNav'
import StatusFooter from '../StatusFooter/StatusFooter'
import OfflineBanner from '../../shared/components/OfflineBanner.jsx'

function AppShell({ children }) {
  return (
    <div className="app-shell" style={{ position: 'relative' }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'radial-gradient(var(--outline-variant) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        opacity: 0.15,
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Sidebar />
      <TopBar />
      <main className="app-content" style={{ position: 'relative', zIndex: 1 }}>
        <OfflineBanner />
        {children}
      </main>
      <BottomNav />
      <StatusFooter />
    </div>
  )
}

export default AppShell
