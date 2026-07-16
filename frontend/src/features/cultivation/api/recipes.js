import client from '../../../shared/api/axiosInstance'

export async function getRecipes(params = {}) {
  const { data } = await client.get('/recipes', { params })
  return data.data ?? data
}

export async function createRecipe(payload) {
  const { data } = await client.post('/recipes', payload)
  return data
}
