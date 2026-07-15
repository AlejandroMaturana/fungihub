import client from '../../../shared/api/axiosInstance'

export async function getRecipes(params = {}) {
  const { data } = await client.get('/api/recipes', { params })
  return data
}

export async function createRecipe(payload) {
  const { data } = await client.post('/api/recipes', payload)
  return data
}
