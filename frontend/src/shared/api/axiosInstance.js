import axios from 'axios'

const client = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('mush2_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED') {
      const refreshToken = sessionStorage.getItem('mush2_refresh_token')
      if (refreshToken) {
        try {
          const { data } = await axios.post('/api/v1/auth/refresh', { refreshToken })
          sessionStorage.setItem('mush2_access_token', data.token.accessToken)
          sessionStorage.setItem('mush2_refresh_token', data.token.refreshToken)
          err.config.headers.Authorization = `Bearer ${data.token.accessToken}`
          return client(err.config)
        } catch {
          sessionStorage.removeItem('mush2_user')
          sessionStorage.removeItem('mush2_access_token')
          sessionStorage.removeItem('mush2_refresh_token')
          window.location.href = '/'
        }
      }
    }
    return Promise.reject(err)
  }
)

export default client
