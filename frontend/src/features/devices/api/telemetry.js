import client from '../../../shared/api/axiosInstance'

export async function getLatestTelemetry(deviceId) {
  const { data } = await client.get(`/api/telemetry/${deviceId}/latest`)
  return data
}

export async function getTelemetryHistory(deviceId, params = {}) {
  const { data } = await client.get(`/api/telemetry/${deviceId}/history`, { params })
  return data
}
