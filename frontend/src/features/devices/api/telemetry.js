import client from '../../../shared/api/axiosInstance'

export async function getLatestTelemetry(deviceId) {
  const { data } = await client.get(`/devices/${deviceId}/telemetry/latest`)
  return data
}

export async function getLatestHealth(deviceId) {
  const { data } = await client.get(`/devices/${deviceId}/health/latest`)
  return data
}

export async function getTelemetryHistory(deviceId, params = {}) {
  const { data } = await client.get(`/devices/${deviceId}/telemetry`, { params })
  return data
}
