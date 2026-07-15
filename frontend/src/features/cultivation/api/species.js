import client from '../../../shared/api/axiosInstance'

export async function getSpecies(params = {}) {
  const { data } = await client.get('/api/species', { params })
  return data
}

export async function getSpeciesById(id) {
  const { data } = await client.get(`/api/species/${id}`)
  return data
}
