import client from '../../../shared/api/axiosInstance'

export async function getSpecies(params = {}) {
  const { data } = await client.get('/species', { params })
  return data.data ?? data
}

export async function getSpeciesById(id) {
  const { data } = await client.get(`/species/${id}`)
  return data
}
