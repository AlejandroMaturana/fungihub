import { useState } from 'react'
import { useAuth } from '../../api/AuthContext.jsx'
import ToggleSwitch from '../../components/ui/ToggleSwitch.jsx'

function UserSettings() {
  const { user } = useAuth()
  const [twoFA, setTwoFA] = useState(false)
  const [showModal, setShowModal] = useState(null)
  const [step, setStep] = useState(1)
  const [verifyCode, setVerifyCode] = useState('')

  function handleSetup() {
    setShowModal('setup')
    setStep(1)
    setVerifyCode('')
  }

  function handleDisable() {
    setShowModal('disable')
  }

  function confirmDisable() {
    setTwoFA(false)
    setShowModal(null)
  }

  function confirmSetup() {
    setTwoFA(true)
    setShowModal(null)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-headline-lg text-on-surface mb-1">User Configuration</h1>
        <p className="text-on-surface-variant text-body-md">Profile and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="glass-card p-5 rounded-xl border border-outline-variant flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <span className="material-symbols-outlined text-secondary">badge</span>
            <h3 className="font-label-caps text-label-caps text-secondary">PROFILE</h3>
          </div>
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-lg border-2 border-primary/30 p-1 mb-4 bg-surface-container-low flex items-center justify-center">
              <span className="material-symbols-outlined text-48px text-primary">person</span>
            </div>
            <h4 className="text-headline-md text-on-surface">{user?.username || '—'}</h4>
            <p className="text-data-sm text-secondary">{user?.role || '—'}</p>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <label className="font-label-caps text-9px text-on-surface-variant block mb-1">USERNAME</label>
              <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant font-data-sm text-on-surface">
                {user?.username || '—'}
              </div>
            </div>
            <div>
              <label className="font-label-caps text-9px text-on-surface-variant block mb-1">EMAIL</label>
              <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant font-data-sm text-on-surface flex items-center justify-between">
                <span>{user?.email || '—'}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-sm">edit</span>
              </div>
            </div>
            <div>
              <label className="font-label-caps text-9px text-on-surface-variant block mb-1">ROLE</label>
              <div className="bg-surface-container-lowest p-3 rounded border border-outline-variant font-data-sm text-primary">
                {user?.role || '—'}
              </div>
            </div>
          </div>
        </section>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary">security</span>
                <h3 className="font-label-caps text-label-caps text-secondary">SECURITY</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-9px font-bold border ${twoFA ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-container-high text-on-surface-variant border-outline-variant'}`}>
                {twoFA ? '2FA ON' : '2FA OFF'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">fingerprint</span>
                  <div className="flex-1">
                    <p className="text-body-md text-on-surface font-semibold">2FA Authentication</p>
                    <p className="text-10px text-on-surface-variant">{twoFA ? 'Active' : 'Not configured'}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  {twoFA ? (
                    <button onClick={handleDisable} className="text-10px font-label-caps text-error hover:underline">DISABLE</button>
                  ) : (
                    <button onClick={handleSetup} className="text-10px font-label-caps text-primary hover:underline">SET UP</button>
                  )}
                </div>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded border border-outline-variant">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">vpn_key</span>
                  <div className="flex-1">
                    <p className="text-body-md text-on-surface font-semibold">Crypto Keys</p>
                    <p className="text-10px text-on-surface-variant">—</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-10px font-label-caps text-on-surface-variant">Not available</span>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card p-5 rounded-xl border border-outline-variant">
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-secondary">tune</span>
              <h3 className="font-label-caps text-label-caps text-secondary">PREFERENCES</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-label-caps text-10px text-on-surface-variant block mb-1">LOCALE & LANGUAGE</label>
                <select className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-body-md text-on-surface">
                  <option>Español</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="font-label-caps text-10px text-on-surface-variant block mb-1">TIME ZONE</label>
                <div className="bg-surface-container-lowest p-2 border border-outline-variant rounded text-body-md text-on-surface flex justify-between items-center">
                  <span>UTC —</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">schedule</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {showModal === 'setup' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-xl border border-outline-variant w-full max-w-lg mx-4 overflow-hidden">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-label-caps text-label-caps text-on-surface">SET UP 2FA</h3>
              <button onClick={() => setShowModal(null)} className="material-symbols-outlined text-on-surface-variant hover:text-on-surface">close</button>
            </div>

            {step === 1 && (
              <div className="p-5 space-y-4">
                <p className="text-body-md text-on-surface-variant">
                  Two-factor authentication requires a backend endpoint to generate the QR code and secret. Configure via the API when available.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowModal(null)} className="px-4 py-2 border border-outline text-on-surface-variant font-label-caps text-10px rounded hover:border-primary transition-all">CANCEL</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showModal === 'disable' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-xl border border-outline-variant w-full max-w-sm mx-4 p-5">
            <h3 className="font-label-caps text-label-caps text-on-surface mb-3">DISABLE 2FA</h3>
            <p className="text-body-md text-on-surface-variant mb-5">
              This requires a backend endpoint to deactivate. Not available yet.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(null)} className="px-4 py-2 border border-outline text-on-surface-variant font-label-caps text-10px rounded hover:border-primary transition-all">CANCEL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserSettings
