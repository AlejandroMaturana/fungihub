// Backward compatibility - all imports should use feature API modules directly
// or shared/api/axiosInstance for the raw Axios client
export { default } from '../shared/api/axiosInstance'

export { login, register } from '../features/auth/api/auth'
export { getDevices, getDevice, createDevice, updateDevice, getActuators, setActuatorDirect } from '../features/devices/api/devices'
export { getLatestTelemetry, getLatestHealth, getTelemetryHistory } from '../features/devices/api/telemetry'
export { getTelegramDeviceConfig, updateTelegramDeviceConfig } from '../features/devices/api/telegram'
export { getCycles, createCycle, updateCycle, getBioactives, createBioactive, getBioactivesCorrelation } from '../features/cultivation/api/cycles'
export { getRecipes, createRecipe } from '../features/cultivation/api/recipes'
export { getSpecies, getSpeciesById } from '../features/cultivation/api/species'
export { getChamberAnalytics } from '../features/analytics/api/analytics'
export { getAlarmStats, getAlarms, getAlarmById, acknowledgeAlarm, resolveAlarm } from '../features/alarms/api/alarms'
export { getAuditLogs } from '../features/logs/api/audit'
export { getMqttDiagnostics, publishMqttTest } from '../features/diagnostics/api/mqtt'
export {
  getProfile, updateProfileSettings, changePassword,
  linkTelegram, getTelegramStatus, unlinkTelegram,
  getApiKeys, createApiKey, rotateApiKey, deleteApiKey,
  getSystemSettings, updateSystemSettings, seedSystemSettings,
  configureTelegramBot, getTelegramBotStatus,
  validateThingSpeak,
  getSubscription, getSubscriptionUsage, upgradePlan, cancelSubscription,
} from '../features/settings/api/settings'
