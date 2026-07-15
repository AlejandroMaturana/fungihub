import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/overview', { replace: true }) }, [navigate])
  return null
}

export default Home
