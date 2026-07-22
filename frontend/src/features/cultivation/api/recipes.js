import client from '../../../shared/api/axiosInstance'

export async function getRecipes(params = {}) {
  const { data } = await client.get('/recipes', { params })
  return data.data ?? data
}

export async function getRecipe(id) {
  const { data } = await client.get(`/recipes/${id}`)
  return data
}

export async function createRecipe(payload) {
  const { data } = await client.post('/recipes', payload)
  return data
}

export async function updateRecipe(id, payload) {
  const { data } = await client.put(`/recipes/${id}`, payload)
  return data
}
