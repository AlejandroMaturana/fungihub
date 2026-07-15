import client from '../../../shared/api/axiosInstance'

export async function getCycles(params = {}) {
  const { data } = await client.get('/cycles', { params })
  return data.data ?? data
}

export async function createCycle(payload) {
  const { data } = await client.post('/cycles', payload)
  return data
}

export async function updateCycle(id, payload) {
  const { data } = await client.put(`/cycles/${id}`, payload)
  return data
}

export async function getBioactives(cycleId) {
  const { data } = await client.get(`/cycles/${cycleId}/bioactives`)
  return data
}

export async function createBioactive(cycleId, payload) {
  const { data } = await client.post(`/cycles/${cycleId}/bioactives`, payload)
  return data
}

export async function getBioactivesCorrelation(cycleId) {
  const { data } = await client.get(`/cycles/${cycleId}/bioactives/correlation`)
  return data
}
