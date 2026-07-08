import { useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import { updateProfile } from '../../api/client.js'

function UserSettings() {
  const { user } = useAuth()
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const hasChanges = username !== (user?.username || '') || email !== (user?.email || '')

  async function handleSave(e) {
    e.preventDefault()
    if (!hasChanges) return
    setSaving(true)
    setMsg(null)
    try {
      const updated = await updateProfile({ username, email })
      setMsg({ type: 'ok', text: 'Profile updated' })
      sessionStorage.setItem('mush2_user', JSON.stringify(updated))
      window.location.reload()
    } catch (err) {
      setMsg({ type: 'err', text: err.response?.data?.error || err.message || 'Failed to update' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface mb-1">User Configuration</h1>
        <p className="text-on-surface-variant text-body-md">Edit your profile information.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card p-6 rounded-xl border border-outline-variant">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-secondary">badge</span>
          <h3 className="font-label-caps text-label-caps text-secondary">PROFILE</h3>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-lg border-2 border-primary/30 p-1 mb-3 bg-surface-container-low flex items-center justify-center">
            <span className="material-symbols-outlined text-40px text-primary">person</span>
          </div>
          <p className="text-data-sm text-secondary">{user?.role || '—'}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="font-label-caps text-9px text-on-surface-variant block mb-1">USERNAME</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="font-label-caps text-9px text-on-surface-variant block mb-1">EMAIL</label>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded p-3 text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {msg && (
            <p className={`text-body-md ${msg.type === 'ok' ? 'text-primary' : 'text-error'}`}>{msg.text}</p>
          )}

          <button
            type="submit"
            disabled={saving || !hasChanges}
            className="w-full py-2.5 bg-primary text-on-primary font-label-caps text-label-caps rounded hover:opacity-90 disabled:opacity-40 transition-all"
          >
            {saving ? 'SAVING...' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserSettings
