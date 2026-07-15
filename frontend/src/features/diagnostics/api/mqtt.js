import client from '../../../shared/api/axiosInstance'

export async function getMqttDiagnostics() {
  const { data } = await client.get('/api/diagnostics/mqtt')
  return data
}

export async function publishMqttTest(topic, payload) {
  const { data } = await client.post('/api/diagnostics/mqtt/publish', { topic, payload })
  return data
}
