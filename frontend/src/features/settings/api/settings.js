import client from '../../../shared/api/axiosInstance'

// Profile
export async function getProfile() {
  const { data } = await client.get('/api/settings/profile')
  return data
}

export async function updateProfileSettings(payload) {
  const { data } = await client.put('/api/settings/profile', payload)
  return data
}

export async function changePassword(payload) {
  const { data } = await client.put('/api/settings/password', payload)
  return data
}

// Telegram
export async function linkTelegram(payload) {
  const { data } = await client.post('/api/settings/telegram/link', payload)
  return data
}

export async function getTelegramStatus() {
  const { data } = await client.get('/api/settings/telegram/status')
  return data
}

export async function unlinkTelegram() {
  const { data } = await client.delete('/api/settings/telegram')
  return data
}

// API Keys
export async function getApiKeys() {
  const { data } = await client.get('/api/settings/api-keys')
  return data
}

export async function createApiKey(payload) {
  const { data } = await client.post('/api/settings/api-keys', payload)
  return data
}

export async function rotateApiKey(id) {
  const { data } = await client.post(`/api/settings/api-keys/${id}/rotate`)
  return data
}

export async function deleteApiKey(id) {
  const { data } = await client.delete(`/api/settings/api-keys/${id}`)
  return data
}

// System
export async function getSystemSettings() {
  const { data } = await client.get('/api/settings/system')
  return data
}

export async function updateSystemSettings(payload) {
  const { data } = await client.put('/api/settings/system', payload)
  return data
}

export async function seedSystemSettings() {
  const { data } = await client.post('/api/settings/system/seed')
  return data
}

export async function configureTelegramBot(payload) {
  const { data } = await client.post('/api/settings/telegram-bot', payload)
  return data
}

export async function getTelegramBotStatus() {
  const { data } = await client.get('/api/settings/telegram-bot/status')
  return data
}

// ThingSpeak
export async function validateThingSpeak(payload) {
  const { data } = await client.post('/api/settings/thingspeak/validate', payload)
  return data
}

// Subscription
export async function getSubscription() {
  const { data } = await client.get('/api/settings/subscription')
  return data
}

export async function getSubscriptionUsage() {
  const { data } = await client.get('/api/settings/subscription/usage')
  return data
}

export async function upgradePlan(payload) {
  const { data } = await client.post('/api/settings/subscription/upgrade', payload)
  return data
}

export async function cancelSubscription() {
  const { data } = await client.delete('/api/settings/subscription')
  return data
}
