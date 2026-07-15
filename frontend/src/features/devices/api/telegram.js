import client from '../../../shared/api/axiosInstance'

export async function getTelegramDeviceConfig(deviceId) {
  const { data } = await client.get(`/api/devices/${deviceId}/telegram`)
  return data
}

export async function updateTelegramDeviceConfig(deviceId, payload) {
  const { data } = await client.put(`/api/devices/${deviceId}/telegram`, payload)
  return data
}
