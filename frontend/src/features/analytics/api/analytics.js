import client from '../../../shared/api/axiosInstance'

export async function getChamberAnalytics(deviceId, params = {}) {
  const { data } = await client.get(`/analytics/chamber/${deviceId}`, { params })
  return data
}
