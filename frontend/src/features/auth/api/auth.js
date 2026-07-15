import client from '../../../shared/api/axiosInstance'

export async function login(username, password) {
  const { data } = await client.post('/api/auth/login', { username, password })
  return data
}

export async function register(username, password, role) {
  const { data } = await client.post('/api/auth/register', { username, password, role })
  return data
}
