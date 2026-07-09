import { useState, useEffect } from 'react'
import { getDevices, getDevice, updateDevice, validateThingSpeak } from '../../api/client.js'
import LoadingState from '../../components/ui/LoadingState.jsx'
import ErrorState from '../../components/ui/ErrorState.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'

function DeviceSettings() {
  const [devices, setDevices] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [renameMsg, setRenameMsg] = useState(null)
  const [tsApiKey, setTsApiKey] = useState('')
  const [tsChannels, setTsChannels] = useState([])
  const [tsSelectedChannel, setTsSelectedChannel] = useState(null)
  const [tsChannelId, setTsChannelId] = useState('')
  const [tsReadKey, setTsReadKey] = useState('')
  const [tsWriteKey, setTsWriteKey] = useState('')
  const [tsSyncInterval, setTsSyncInterval] = useState(300000)
  const [tsMsg, setTsMsg] = useState(null)
  const [tsValidating, setTsValidating] = useState(false)

  async function loadDevices() {
    try {
      const devs = await getDevices()
      setDevices(devs)
      if (!selectedId && devs[0]) {
        setSelectedId(devs[0].id)
      }
      setError(null)
    } catch (err) {
      setError(err.message || 'Connection error')
    } finally {
      setLoading(false)
    }
  }

  async function loadDeviceDetail(id) {
    if (!id) return
    setLoadingDetail(true)
    try {
      const dev = await getDevice(id)
      setDevice(dev)
      setRenameValue(dev.chamberName || dev.deviceId || '')
      setTsApiKey('')
      setTsChannels([])
      setTsSelectedChannel(null)
      setTsChannelId(dev.thingSpeakChannelId || '')
      setTsReadKey(dev.thingSpeakReadKey || '')
      setTsWriteKey(dev.thingSpeakWriteKey || '')
      setTsSyncInterval(dev.thingSpeakSyncInterval || 300000)
      setTsMsg(null)
      setError(null)
    } catch (err) {
      setError(err.message || 'Connection error')
    } finally {
      setLoadingDetail(false)
    }
  }

  useEffect(() => { loadDevices() }, [])
  useEffect(() => { loadDeviceDetail(selectedId) }, [selectedId])

  async function handleRename() {
    if (!device || !renameValue.trim()) return
    setSaving(true)
    setRenameMsg(null)
    try {
      await updateDevice(device.id, { chamberName: renameValue.trim() })
      setDevice(prev => ({ ...prev, chamberName: renameValue.trim() }))
      setRenameMsg({ type: 'ok', text: 'Device name updated' })
    } catch (err) {
      setRenameMsg({ type: 'err', text: err.message || 'Failed to rename' })
    } finally {
      setSaving(false)
    }
  }

  async function handleValidateThingSpeak() {
    if (!device || !tsApiKey.trim()) return
    setTsValidating(true)
    setTsMsg(null)
    setTsChannels([])
    setTsSelectedChannel(null)
    try {
      const result = await validateThingSpeak(device.id, tsApiKey.trim())
      if (result.valid) {
        setTsChannels(result.channels)
        setTsMsg({ type: 'ok', text: `Key valid — ${result.channels.length} channel(s) found` })
      }
    } catch (err) {
      setTsMsg({ type: 'err', text: err.response?.data?.error || 'Invalid API key' })
    } finally {
      setTsValidating(false)
    }
  }

  function handleSelectChannel(ch) {
    setTsSelectedChannel(ch)
    setTsChannelId(String(ch.id))
    setTsReadKey(ch.readKey || '')
    setTsWriteKey(ch.writeKey || '')
  }

  async function handleSaveThingSpeak() {
    if (!device) return
    setSaving(true)
    setTsMsg(null)
    try {
      const enabled = !!tsChannelId
      const payload = {
        thingSpeakEnabled: enabled,
        thingSpeakChannelId: enabled ? tsChannelId : null,
        thingSpeakReadKey: enabled ? tsReadKey : null,
        thingSpeakWriteKey: enabled ? tsWriteKey : null,
        thingSpeakSyncInterval: parseInt(tsSyncInterval, 10) || 300000,
      }
      await updateDevice(device.id, payload)
      setDevice(prev => ({ ...prev, ...payload }))
      setTsMsg({ type: 'ok', text: enabled ? 'ThingSpeak enabled and saved' : 'ThingSpeak disabled' })
    } catch (err) {
      setTsMsg({ type: 'err', text: err.message || 'Failed to save' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDisconnectThingSpeak() {
    if (!device) return
    setSaving(true)
    setTsMsg(null)
    try {
      await updateDevice(device.id, {
        thingSpeakEnabled: false,
        thingSpeakChannelId: null,
        thingSpeakReadKey: null,
        thingSpeakWriteKey: null,
      })
      setDevice(prev => ({ ...prev, thingSpeakEnabled: false, thingSpeakChannelId: null, thingSpeakReadKey: null, thingSpeakWriteKey: null }))
      setTsApiKey('')
      setTsChannels([])
      setTsSelectedChannel(null)
      setTsChannelId('')
      setTsReadKey('')
      setTsWriteKey('')
      setTsMsg({ type: 'ok', text: 'ThingSpeak disconnected' })
    } catch (err) {
      setTsMsg({ type: 'err', text: err.message || 'Failed to disconnect' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingState message="Loading device configuration..." icon="developer_board" />
  if (error && devices.length === 0) return <ErrorState message={error} onRetry={loadDevices} />
  if (devices.length === 0) return <EmptyState icon="developer_board" title="No devices" message="Connect a device to configure hardware settings." />

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-headline-lg text-on-surface mb-1">Device Configuration</h1>
            <p className="text-on-surface-variant text-body-md">Identity and hardware parameters.</p>
          </div>
          <select
            className="bg-surface-container border border-outline-variant rounded-md text-body-md text-on-surface px-3 py-1.5 cursor-pointer"
            value={selectedId || ''}
            onChange={e => setSelectedId(Number(e.target.value))}
          >
            {devices.map(d => (
              <option key={d.id} value={d.id}>{d.chamberName || d.deviceId}</option>
            ))}
          </select>
        </div>
      </div>

      {loadingDetail ? (
        <LoadingState message="Loading device details..." />
      ) : device ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">badge</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">IDENTITY</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">DEVICE ID</p>
                <p className="font-mono text-data-sm text-secondary tracking-widest">{device.deviceId || '—'}</p>
              </div>
              <div>
                <p className="font-label-caps text-9px text-on-surface-variant mb-1">CHAMBER NAME</p>
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    placeholder="Enter name..."
                  />
                  <button
                    onClick={handleRename}
                    disabled={saving || !renameValue.trim()}
                    className="px-3 py-1.5 bg-primary text-on-primary font-label-caps text-10px rounded hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    {saving ? '...' : 'SAVE'}
                  </button>
                </div>
                {renameMsg && (
                  <p className={`text-10px mt-1 ${renameMsg.type === 'ok' ? 'text-primary' : 'text-error'}`}>{renameMsg.text}</p>
                )}
              </div>
            </div>
          </section>

          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">settings</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">HARDWARE</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">STATUS</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-primary breathing-pulse' : 'bg-outline-variant'}`} />
                  <span className="font-mono text-data-sm text-on-surface">{device.status || '—'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">MAC ADDRESS</span>
                <span className="font-mono text-data-sm text-on-surface">{device.macAddress || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">FIRMWARE</span>
                <span className="font-mono text-data-sm text-on-surface">{device.firmwareVersion || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">HW REVISION</span>
                <span className="font-mono text-data-sm text-on-surface">{device.hwRevision || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">CHAMBER ID</span>
                <span className="font-mono text-data-sm text-on-surface">{device.chamberId != null ? device.chamberId : '—'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">LOCATION</span>
                <span className="font-mono text-data-sm text-on-surface">{device.chamberLocation || '—'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">SSR MODE</span>
                <span className="font-mono text-data-sm text-on-surface">{device.ssrActiveLow ? 'Active Low' : 'Active High'}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">LAST SEEN</span>
                <span className="font-mono text-data-sm text-on-surface">{device.lastSeen ? new Date(device.lastSeen).toLocaleString() : '—'}</span>
              </div>
            </div>
          </section>

          <section className="glass-card p-5 rounded-xl border border-outline-variant md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-secondary">cloud_sync</span>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant">THINGSPEAK</h3>
              <span className={`font-label-caps text-9px px-2 py-0.5 rounded ${device.thingSpeakEnabled ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {device.thingSpeakEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                <span className="font-label-caps text-9px text-on-surface-variant">TS_API_KEY</span>
                <div className="flex gap-2">
                  <input
                    className="w-64 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-data-sm text-on-surface font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={tsApiKey}
                    onChange={e => setTsApiKey(e.target.value)}
                    placeholder={device.thingSpeakChannelId ? '••••••••••••••••' : 'Enter your TS API key'}
                    type="password"
                  />
                  <button
                    onClick={handleValidateThingSpeak}
                    disabled={tsValidating || !tsApiKey.trim()}
                    className="px-3 py-1.5 bg-secondary text-on-secondary font-label-caps text-10px rounded hover:opacity-90 disabled:opacity-40 transition-all"
                  >
                    {tsValidating ? '...' : 'VALIDATE'}
                  </button>
                </div>
              </div>

              {tsChannels.length > 0 && (
                <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                  <span className="font-label-caps text-9px text-on-surface-variant">SELECT CHANNEL</span>
                  <select
                    className="w-64 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-data-sm text-on-surface font-mono cursor-pointer"
                    value={tsSelectedChannel?.id || tsChannelId || ''}
                    onChange={e => {
                      const ch = tsChannels.find(c => String(c.id) === e.target.value)
                      if (ch) handleSelectChannel(ch)
                    }}
                  >
                    <option value="">Select a channel...</option>
                    {tsChannels.map(ch => (
                      <option key={ch.id} value={ch.id}>{ch.name || ch.id}</option>
                    ))}
                  </select>
                </div>
              )}

              {tsChannelId && (
                <>
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                    <span className="font-label-caps text-9px text-on-surface-variant">CHANNEL ID</span>
                    <span className="font-mono text-data-sm text-on-surface">{tsChannelId}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                    <span className="font-label-caps text-9px text-on-surface-variant">READ KEY</span>
                    <input
                      className="w-64 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-data-sm text-on-surface font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={tsReadKey}
                      onChange={e => setTsReadKey(e.target.value)}
                      placeholder="Read API key"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                    <span className="font-label-caps text-9px text-on-surface-variant">WRITE KEY</span>
                    <input
                      className="w-64 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-data-sm text-on-surface font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={tsWriteKey}
                      onChange={e => setTsWriteKey(e.target.value)}
                      placeholder="Write API key"
                    />
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded">
                    <span className="font-label-caps text-9px text-on-surface-variant">SYNC INTERVAL</span>
                    <div className="flex items-center gap-2">
                      <input
                        className="w-24 bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 text-data-sm text-on-surface font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                        type="number"
                        min="60000"
                        step="60000"
                        value={tsSyncInterval}
                        onChange={e => setTsSyncInterval(e.target.value)}
                      />
                      <span className="font-label-caps text-9px text-on-surface-variant">ms</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={handleDisconnectThingSpeak}
                      disabled={saving}
                      className="px-3 py-1.5 bg-error text-on-error font-label-caps text-10px rounded hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      DISCONNECT
                    </button>
                    <button
                      onClick={handleSaveThingSpeak}
                      disabled={saving || !tsChannelId.trim()}
                      className="px-3 py-1.5 bg-primary text-on-primary font-label-caps text-10px rounded hover:opacity-90 disabled:opacity-40 transition-all"
                    >
                      {saving ? '...' : 'SAVE'}
                    </button>
                  </div>
                </>
              )}

              {tsMsg && (
                <p className={`text-10px ${tsMsg.type === 'ok' ? 'text-primary' : 'text-error'}`}>{tsMsg.text}</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default DeviceSettings
