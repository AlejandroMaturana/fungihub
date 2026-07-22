import client from '../../../shared/api/axiosInstance'

// Profile
export async function getProfile() {
  const { data } = await client.get('/settings/profile')
  return data
}

export async function updateProfileSettings(payload) {
  const { data } = await client.patch('/settings/profile', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await client.post('/settings/change-password', payload)
  return data
}

// Telegram
export async function linkTelegram(payload) {
  const { data } = await client.post('/settings/telegram/link', payload)
  return data
}

export async function getTelegramStatus() {
  const { data } = await client.get('/settings/telegram/link')
  return data
}

export async function unlinkTelegram() {
  const { data } = await client.post('/settings/telegram/unlink')
  return data
}

// API Keys
export async function getApiKeys() {
  const { data } = await client.get('/settings/api-keys')
  return data
}

export async function createApiKey(payload) {
  const { data } = await client.post('/settings/api-keys', payload)
  return data
}

export async function rotateApiKey(id) {
  const { data } = await client.post(`/settings/api-keys/${id}/rotate`)
  return data
}

export async function deleteApiKey(id) {
  const { data } = await client.delete(`/settings/api-keys/${id}`)
  return data
}

// System
export async function getSystemSettings() {
  const { data } = await client.get('/settings/system')
  return data
}

export async function updateSystemSettings(payload) {
  const { data } = await client.patch('/settings/system', payload)
  return data
}

export async function seedSystemSettings() {
  const { data } = await client.post('/settings/system/seed')
  return data
}

export async function configureTelegramBot(payload) {
  const { data } = await client.post('/settings/telegram/configure', payload)
  return data
}

export async function getTelegramBotStatus() {
  const { data } = await client.get('/settings/telegram/bot-status')
  return data
}

// ThingSpeak
export async function validateThingSpeak(deviceId, apiKey) {
  const { data } = await client.post(`/devices/${deviceId}/thingSpeak/validate`, { apiKey })
  return data
}

// Subscription
export async function getSubscription() {
  const { data } = await client.get('/settings/subscription')
  return data
}

export async function getSubscriptionUsage() {
  const { data } = await client.get('/settings/subscription/usage')
  return data
}

export async function upgradePlan(payload) {
  const { data } = await client.post('/settings/subscription/upgrade', payload)
  return data
}

export async function cancelSubscription() {
  const { data } = await client.delete('/settings/subscription')
  return data
}
