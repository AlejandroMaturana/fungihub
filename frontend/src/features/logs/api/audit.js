import client from '../../../shared/api/axiosInstance'

export async function getAuditLogs(params = {}) {
  const { data } = await client.get('/audit-logs', { params })
  return data
}
