import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

export default function Register() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
      await axios.post(`${apiUrl}/auth/register`, { username, email, password })
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.detail || err?.response?.data || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md glass-panel p-8">
        <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
        <p className="text-gray-400 mb-8">Registration is optional. Guests can still run diagnoses.</p>

        {error && (
          <div className="mb-6 text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            {String(error)}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-900/40 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-indigo-400" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-900/40 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-indigo-400" required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-gray-900/40 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-indigo-400" required />
          </div>

          <button disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-400">
          Already have an account? <Link className="text-indigo-400 hover:text-indigo-300" to="/login">Login</Link>.
        </div>
      </motion.div>
    </div>
  )
}