import client from '../../../shared/api/axiosInstance'

export async function getTelegramDeviceConfig(deviceId) {
  const { data } = await client.get(`/devices/${deviceId}/telegram`)
  return data
}

export async function updateTelegramDeviceConfig(deviceId, payload) {
  const { data } = await client.put(`/devices/${deviceId}/telegram`, payload)
  return data
}
