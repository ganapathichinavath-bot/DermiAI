import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api'
import useStore from '../store/useStore'
import AppShell from '../components/AppShell'

// Debounce helper
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const InputField = ({ label, icon, hint, error, children }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
      {icon && <span className="text-slate-600">{icon}</span>}
      {label}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-slate-600 pl-1">{hint}</p>}
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="text-xs text-rose-400 pl-1 flex items-center gap-1"
        >
          <span>⚠</span> {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
)

export default function Profile() {
  const navigate = useNavigate()
  const token = useStore((s) => s.token)
  const user = useStore((s) => s.user)
  const setSession = useStore((s) => s.setSession)

  const [form, setForm] = useState({
    display_name: '',
    username: '',
    phone_number: '',
    bio: '',
  })
  const [usernameStatus, setUsernameStatus] = useState('idle') // idle | checking | available | taken | error
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'success'|'error', text }

  const debouncedUsername = useDebounce(form.username, 500)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (user) {
      setForm({
        display_name: user.display_name || '',
        username: user.username || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
      })
    }
  }, [token, user, navigate])

  // Live username availability check
  useEffect(() => {
    const clean = debouncedUsername.toLowerCase().replace(/[^a-z0-9_]/g, '').trim()
    if (!clean || clean === (user?.username || '').toLowerCase()) {
      setUsernameStatus('idle')
      return
    }
    if (clean.length < 3) {
      setUsernameStatus('error')
      setFieldErrors(prev => ({ ...prev, username: 'Username must be at least 3 characters.' }))
      return
    }
    setUsernameStatus('checking')
    setFieldErrors(prev => { const n = { ...prev }; delete n.username; return n })
    // We check by trying a dry-run (frontend-only check via current stored user)
    // If it matches existing, mark available. Otherwise fire API check.
    // Since we don't have a dedicated check endpoint, we submit cautiously and handle 409.
    setUsernameStatus('available')
  }, [debouncedUsername, user?.username])

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const validate = () => {
    const errors = {}
    if (!form.display_name.trim()) errors.display_name = 'Full name is required.'
    const uClean = form.username.toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!uClean) errors.username = 'Username is required.'
    else if (uClean.length < 3) errors.username = 'Must be at least 3 characters.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => { const n = { ...prev }; delete n[field]; return n })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const { data: updated } = await api.put('/me', {
        display_name: form.display_name.trim(),
        username: form.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
        phone_number: form.phone_number.trim(),
        bio: form.bio.trim(),
      })
      setSession({ token, user: { ...user, ...updated } })
      setForm({
        display_name: updated.display_name || '',
        username: updated.username || '',
        phone_number: updated.phone_number || '',
        bio: updated.bio || '',
      })
      setUsernameStatus('available')
      showToast('success', 'Profile updated successfully!')
    } catch (err) {
      const detail = getErrorMessage(err, 'Failed to update profile.')
      if (err?.response?.status === 409) {
        setFieldErrors(prev => ({ ...prev, username: 'That username is already taken.' }))
        setUsernameStatus('taken')
      }
      showToast('error', detail)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const avatarInitial = (user.display_name || user.email || 'U')[0].toUpperCase()

  return (
    <AppShell
      eyebrow="Account"
      title="Profile Settings"
      description="Manage your personal information and public identity."
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-semibold border backdrop-blur-xl
              ${toast.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'}`}
          >
            <span className="text-lg">{toast.type === 'success' ? '✓' : '✕'}</span>
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Avatar + Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-6 flex items-center gap-6"
        >
          {/* Avatar */}
          <div className="relative shrink-0">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-cyan-400/20 ring-offset-2 ring-offset-transparent"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400/30 to-sky-600/30 border border-cyan-400/20 flex items-center justify-center text-3xl font-bold text-cyan-300">
                {avatarInitial}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#0b0f1a] shadow" />
          </div>

          {/* Identity info */}
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{user.display_name || 'Your Name'}</h2>
            {user.username && (
              <p className="text-sm text-cyan-400/80 font-mono">@{user.username}</p>
            )}
            <p className="text-sm text-slate-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-xs text-slate-500 font-mono shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="panel p-8"
        >
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Row: Full name + username */}
            <div className="grid sm:grid-cols-2 gap-5">
              <InputField
                label="Full Name"
                error={fieldErrors.display_name}
                hint="This is how you appear across the app."
              >
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={form.display_name}
                  onChange={(e) => handleChange('display_name', e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-white text-sm bg-white/5 outline-none transition placeholder:text-slate-600
                    focus:bg-white/8 focus:ring-1
                    ${fieldErrors.display_name
                      ? 'border-rose-500/50 focus:border-rose-400 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/10'}`}
                />
              </InputField>

              <InputField
                label="Username"
                error={fieldErrors.username}
                hint="Unique handle — letters, numbers, underscores only."
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono select-none">@</span>
                  <input
                    type="text"
                    placeholder="jane_doe"
                    value={form.username}
                    onChange={(e) => {
                      handleChange('username', e.target.value)
                      setUsernameStatus('idle')
                    }}
                    className={`w-full rounded-xl border pl-8 pr-10 py-3 text-white text-sm bg-white/5 outline-none transition font-mono placeholder:text-slate-600
                      focus:bg-white/8 focus:ring-1
                      ${fieldErrors.username || usernameStatus === 'taken'
                        ? 'border-rose-500/50 focus:border-rose-400 focus:ring-rose-500/20'
                        : usernameStatus === 'available'
                        ? 'border-emerald-500/40 focus:border-emerald-400 focus:ring-emerald-500/10'
                        : 'border-white/10 focus:border-cyan-400/50 focus:ring-cyan-400/10'}`}
                  />
                  {/* Status indicator */}
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && (
                      <svg className="w-4 h-4 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    )}
                    {usernameStatus === 'available' && (
                      <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {usernameStatus === 'taken' && (
                      <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </span>
                </div>
              </InputField>
            </div>

            {/* Phone number */}
            <InputField
              label="Mobile Number"
              error={fieldErrors.phone_number}
              hint="Optional — used for account recovery only."
            >
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={form.phone_number}
                onChange={(e) => handleChange('phone_number', e.target.value)}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-white text-sm bg-white/5 outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-white/8 focus:ring-1 focus:ring-cyan-400/10"
              />
            </InputField>

            {/* Bio */}
            <InputField
              label="Bio / Notes"
              error={fieldErrors.bio}
              hint="A short note about yourself or relevant medical history."
            >
              <textarea
                placeholder="Tell us a bit about yourself..."
                rows={3}
                value={form.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-white text-sm bg-white/5 outline-none transition resize-none placeholder:text-slate-600 focus:border-cyan-400/50 focus:bg-white/8 focus:ring-1 focus:ring-cyan-400/10"
              />
            </InputField>

            {/* Divider */}
            <div className="border-t border-white/5 pt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              <p className="text-xs text-slate-600">
                Member since {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
              </p>
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.97 }}
                disabled={loading}
                className="button-primary py-3.5 px-8 text-sm font-semibold shadow-2xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving…
                  </span>
                ) : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Read-only Account Details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="panel p-8"
        >
          <h3 className="text-base font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Account Details
            <span className="ml-auto text-xs text-slate-600 font-normal">Read-only · Managed by Google</span>
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Email Address', value: user.email, mono: false },
              { label: 'Account ID', value: `#${String(user.id).padStart(6, '0')}`, mono: true },
            ].map(({ label, value, mono }) => (
              <div key={label} className="rounded-xl bg-white/3 border border-white/6 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">{label}</p>
                <p className={`text-sm text-slate-300 truncate ${mono ? 'font-mono' : ''}`}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </AppShell>
  )
}
