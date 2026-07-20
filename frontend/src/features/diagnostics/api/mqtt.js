import client from '../../../shared/api/axiosInstance'

export async function getMqttDiagnostics() {
  const { data } = await client.get('/diag/mqtt')
  return data
}

export async function publishMqttTest(topic, payload) {
  const { data } = await client.post('/diag/mqtt/publish', { topic, payload })
  return data
}
