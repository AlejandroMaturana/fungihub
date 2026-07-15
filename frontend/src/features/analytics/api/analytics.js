import client from '../../../shared/api/axiosInstance'

export async function getChamberAnalytics(deviceId, params = {}) {
  const { data } = await client.get(`/api/analytics/chamber/${deviceId}`, { params })
  return data
}
