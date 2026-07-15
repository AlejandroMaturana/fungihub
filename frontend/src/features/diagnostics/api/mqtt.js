import client from '../../../shared/api/axiosInstance'

export async function getMqttDiagnostics() {
  const { data } = await client.get('/diagnostics/mqtt')
  return data
}

export async function publishMqttTest(topic, payload) {
  const { data } = await client.post('/diagnostics/mqtt/publish', { topic, payload })
  return data
}
