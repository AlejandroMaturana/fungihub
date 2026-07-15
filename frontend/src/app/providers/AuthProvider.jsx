import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('mush2_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = useCallback((userData, accessToken, refreshToken) => {
    setUser(userData)
    sessionStorage.setItem('mush2_user', JSON.stringify(userData))
    sessionStorage.setItem('mush2_access_token', accessToken)
    sessionStorage.setItem('mush2_refresh_token', refreshToken)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('mush2_user')
    sessionStorage.removeItem('mush2_access_token')
    sessionStorage.removeItem('mush2_refresh_token')
  }, [])

  const getToken = useCallback(() => {
    return sessionStorage.getItem('mush2_access_token')
  }, [])

  const getRefreshToken = useCallback(() => {
    return sessionStorage.getItem('mush2_refresh_token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, getRefreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
