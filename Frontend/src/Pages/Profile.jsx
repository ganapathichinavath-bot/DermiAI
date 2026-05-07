import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import useStore from '../store/useStore'
import AppShell from '../components/AppShell'

export default function Profile() {
  const navigate = useNavigate()
  const token = useStore((s) => s.token)
  const user = useStore((s) => s.user)
  const setSession = useStore((s) => s.setSession)

  const [formData, setFormData] = useState({
    display_name: '',
    phone_number: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    if (user) {
      setFormData({
        display_name: user.display_name || '',
        phone_number: user.phone_number || '',
        bio: user.bio || ''
      })
    }
  }, [token, user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { data: updatedUser } = await api.patch('/me', formData)
      
      // Update local store with new user data
      setSession({ token, user: updatedUser })
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      console.error('Update failed', err)
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <AppShell
      eyebrow="Account Settings"
      title="User Profile"
      description="Update your personal information. These details are stored securely in our database."
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel p-8"
        >
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-white/5">
            <div className="relative">
              <img
                src={user.photo_url || 'https://via.placeholder.com/80'}
                alt="Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/20"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#111827]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.display_name}</h2>
              <p className="text-slate-400 text-sm">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="Enter your name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="+1 (555) 000-0000"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                Bio / Notes
              </label>
              <textarea
                className="input-field min-h-[100px] py-3"
                placeholder="Tell us a bit about yourself or medical history notes..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            {/* Status Messages */}
            {message.text && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-xl text-sm font-medium ${
                  message.type === 'success' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {message.text}
              </motion.div>
            )}

            <div className="pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="button-primary w-full py-4 shadow-xl shadow-indigo-500/20 disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Profile Changes'}
              </motion.button>
            </div>
          </form>
        </motion.div>
        
        <p className="mt-8 text-center text-xs text-slate-600">
          Last updated: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
    </AppShell>
  )
}
