import client from '../../../shared/api/axiosInstance'

export async function getCycles(params = {}) {
  const { data } = await client.get('/api/cycles', { params })
  return data
}

export async function createCycle(payload) {
  const { data } = await client.post('/api/cycles', payload)
  return data
}

export async function updateCycle(id, payload) {
  const { data } = await client.put(`/api/cycles/${id}`, payload)
  return data
}

export async function getBioactives(cycleId) {
  const { data } = await client.get(`/api/cycles/${cycleId}/bioactives`)
  return data
}

export async function createBioactive(cycleId, payload) {
  const { data } = await client.post(`/api/cycles/${cycleId}/bioactives`, payload)
  return data
}

export async function getBioactivesCorrelation(cycleId) {
  const { data } = await client.get(`/api/cycles/${cycleId}/bioactives/correlation`)
  return data
}
