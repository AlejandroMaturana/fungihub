import client from '../../../shared/api/axiosInstance'

export async function getDevices() {
  const { data } = await client.get('/api/devices')
  return data
}

export async function getDevice(id) {
  const { data } = await client.get(`/api/devices/${id}`)
  return data
}

export async function createDevice(payload) {
  const { data } = await client.post('/api/devices', payload)
  return data
}

export async function updateDevice(id, payload) {
  const { data } = await client.put(`/api/devices/${id}`, payload)
  return data
}

export async function getActuators(deviceId) {
  const { data } = await client.get(`/api/devices/${deviceId}/actuators`)
  return data
}

export async function setActuatorDirect(deviceId, actuatorId, value) {
  const { data } = await client.post(`/api/devices/${deviceId}/actuators/${actuatorId}/direct`, { value })
  return data
}
