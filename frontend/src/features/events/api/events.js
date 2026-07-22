import client from '../../../shared/api/axiosInstance'

export async function getEvents(params = {}) {
  const { data } = await client.get('/events', { params })
  return data
}

export async function getDeviceEvents(deviceId, params = {}) {
  const { data } = await client.get(`/events/device/${deviceId}`, { params })
  return data
}
