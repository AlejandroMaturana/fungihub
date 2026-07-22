import client from '../../../shared/api/axiosInstance'

export async function getCycles(params = {}) {
  const { data } = await client.get('/cycles', { params })
  return data.data ?? data
}

export async function getCycle(id) {
  const { data } = await client.get(`/cycles/${id}`)
  return data
}

export async function createCycle(payload) {
  const { data } = await client.post('/cycles', payload)
  return data
}

export async function updateCycle(id, payload) {
  const { data } = await client.patch(`/cycles/${id}`, payload)
  return data
}

export async function transitionCycle(id, payload) {
  const { data } = await client.post(`/cycles/${id}/transition`, payload)
  return data
}

export async function abortCycle(id) {
  const { data } = await client.post(`/cycles/${id}/abort`)
  return data
}

export async function getCycleTransitions(id) {
  const { data } = await client.get(`/cycles/${id}/transitions`)
  return data.data ?? data
}

export async function getCycleStates(id) {
  const { data } = await client.get(`/cycles/${id}/states`)
  return data.data ?? data
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
