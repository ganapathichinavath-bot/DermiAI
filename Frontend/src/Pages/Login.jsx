import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import useStore from '../store/useStore'

export default function Login() {
  const navigate = useNavigate()
  const setToken = useStore((state) => state.setToken)
  const setUser = useStore((state) => state.setUser)
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'register') {
        await api.post('/auth/register', {
          username: form.username,
          email: form.email,
          password: form.password,
        })
      }

      const response = await api.post('/auth/login', {
        username: form.username,
        password: form.password,
      })

      setToken(response.data.access_token)
      setUser(response.data.user)
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="panel flex flex-col justify-between p-8 sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Optional authentication</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white">Save scans without any paid auth provider</h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-400">
              Sign in only if you want scan history stored in SQLite. Guest mode is fully usable and keeps local history directly in the browser.
            </p>
          </div>
          <div className="mt-10 space-y-3 text-sm leading-7 text-slate-300">
            <p>JWT-based sessions with bcrypt password hashing.</p>
            <p>No external identity services, social logins, or subscriptions required.</p>
            <p>The same app can be deployed on Vercel or Netlify for the frontend and Render or Railway for the backend.</p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="panel p-8 sm:p-10">
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
            {['login', 'register'].map((item) => (
              <button
                key={item}
                onClick={() => setMode(item)}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-medium transition ${mode === item ? 'bg-cyan-300/15 text-cyan-100' : 'text-slate-400'}`}
              >
                {item === 'login' ? 'Log in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm text-slate-300">Username</label>
              <input
                className="field"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                required
              />
            </div>
            {mode === 'register' ? (
              <div>
                <label className="mb-2 block text-sm text-slate-300">Email</label>
                <input
                  type="email"
                  className="field"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  required
                />
              </div>
            ) : null}
            <div>
              <label className="mb-2 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                className="field"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <div className="flex flex-wrap gap-3 pt-2">
              <button type="submit" disabled={loading} className="button-primary">
                {loading ? 'Working...' : mode === 'login' ? 'Log in' : 'Create account'}
              </button>
              <Link to="/" className="button-secondary">
                Continue as guest
              </Link>
            </div>
          </form>
        </motion.section>
      </div>
    </div>
  )
}
