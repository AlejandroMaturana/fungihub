import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import DeviceDetail from './pages/DeviceDetail.jsx'
import Recipes from './pages/Recipes.jsx'
import Cycles from './pages/Cycles.jsx'
import Settings from './pages/Settings.jsx'
import Login from './pages/Login.jsx'
import { useAuth } from './api/AuthContext.jsx'

function App() {
  const { user, logout } = useAuth()

  return (
    <BrowserRouter>
      <div className="app">
        {!user ? (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        ) : (
          <>
            <header className="app-header">
              <div className="app-header-left">
                <Link to="/" className="app-title-link">
                  <h1>Mush2</h1>
                </Link>
                <span className="app-subtitle">Control de Ambientes</span>
              </div>
              <nav className="app-nav">
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Dashboard</NavLink>
                <NavLink to="/recipes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Recetas</NavLink>
                <NavLink to="/cycles" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ciclos</NavLink>
                <NavLink to="/settings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Ajustes</NavLink>
              </nav>
              <div className="app-user">
                <span className="user-badge">{user.username}</span>
                <button className="logout-btn" onClick={logout}>Salir</button>
              </div>
            </header>
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/devices/:id" element={<DeviceDetail />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/cycles" element={<Cycles />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
