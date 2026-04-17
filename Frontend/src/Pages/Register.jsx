import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'

export default function Register() {
  const [form, setForm]     = useState({ username: '', email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900 rounded-2xl p-8 border border-slate-800">
        <h1 className="text-3xl font-bold gradient-text mb-2">Create Account</h1>
        <p className="text-slate-400 mb-8 text-sm">Join DermAI platform</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['username','text','Username'],['email','email','Email'],['password','password','Password']].map(([name,type,label]) => (
            <div key={name}>
              <label className="text-slate-300 text-sm block mb-1">{label}</label>
              <input type={type} value={form[name]}
                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500"
                placeholder={`Enter ${label.toLowerCase()}`} required />
            </div>
          ))}
          {error && <p className="text-red-400 text-sm bg-red-950 border border-red-800 rounded-lg px-4 py-2">{error}</p>}
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold">
            {loading ? 'Creating...' : 'Create Account'}
          </motion.button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account? <Link to="/login" className="text-violet-400">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}