import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api, { assetUrl } from '../api'
import useStore from '../store/useStore'
import AppShell from '../components/AppShell'

export default function Dashboard() {
  const navigate = useNavigate()
  const [recentScans, setRecentScans] = useState([])
  const [stats, setStats] = useState({ total: 0, highRisk: 0, lastPrediction: '--' })
  const [loading, setLoading] = useState(true)
  const token = useStore((s) => s.token)
  const user = useStore((s) => s.user)
  const guestHistory = useStore((s) => s.guestHistory)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        if (token) {
          const res = await api.get('/history')
          if (mounted) processHistory(res.data)
        } else {
          processHistory(guestHistory)
        }
      } catch {
        if (mounted) processHistory(token ? [] : guestHistory)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [token, guestHistory])

  const processHistory = (data) => {
    // Sort by most recent
    const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    setRecentScans(sorted.slice(0, 5))

    const highRiskCount = data.filter(d => (d.risk_level || '').toLowerCase() === 'malignant').length

    setStats({
      total: data.length,
      highRisk: highRiskCount,
      lastPrediction: sorted.length > 0 ? sorted[0].prediction : '--'
    })
    setLoading(false)
  }

  return (
    <AppShell
      eyebrow="Free AI skin screening"
      title="Dashboard"
      description="Upload or capture a lesion image to get a prediction with confidence and Grad-CAM explainability."
      actions={
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/scan')}
          className="button-primary"
        >
          New Scan
        </motion.button>
      }
    >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
            <p className="text-gray-400 mt-1">
              {user ? `Welcome back, ${user.display_name.split(' ')[0]}.` : 'Welcome back.'} Here's a summary of your recent activity.
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/scan')}
            className="btn-primary py-3 px-6 whitespace-nowrap shadow-lg shadow-indigo-500/20"
          >
            Start New Scan
          </motion.button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="glass-panel p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Total Scans</h3>
            <p className="text-4xl font-bold text-white">{loading ? '-' : stats.total}</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">High Risk Cases</h3>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-bold text-rose-400">{loading ? '-' : stats.highRisk}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel p-6">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Last Prediction</h3>
            <p className="text-xl font-bold text-white truncate h-10 flex items-center">{loading ? '-' : stats.lastPrediction}</p>
          </motion.div>
        </div>

        {/* Recent Scans */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-xl font-bold text-white mb-4">Recent Scans</h2>
          
          <div className="glass-panel overflow-hidden">
            {loading ? (
              <div className="p-10 text-center text-gray-500">Loading records...</div>
            ) : recentScans.length === 0 ? (
              <div className="p-10 text-center text-gray-500">No recent scans found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-800/40 border-b border-gray-800">
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Image / Time</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Prediction</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence</th>
                    <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentScans.map((scan) => (
                    <tr key={scan.id} onClick={() => navigate('/explain', { state: { result: scan } })} className="hover:bg-gray-800/20 transition cursor-pointer group">
                      <td className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0 border border-gray-700 group-hover:border-indigo-400 transition">
                            <img src={scan.original_url ? assetUrl(scan.original_url) : 'https://via.placeholder.com/150'} alt="scan" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-mono text-xs text-gray-500 mb-0.5">#{String(scan.id).substring(0,6)}</div>
                            <div className="text-sm text-gray-400">
                              {new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-white">{scan.prediction}</span>
                        {(scan.risk_level || '').toLowerCase() === 'malignant' ? (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            High Risk
                          </span>
                        ) : null}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 max-w-[120px]">
                          <div className="w-full bg-gray-800 rounded-full h-1.5 flex-1">
                            <div 
                              className={`h-1.5 rounded-full ${scan.confidence > 90 ? 'bg-emerald-400' : 'bg-indigo-400'}`} 
                              style={{ width: `${scan.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-300 w-10 text-right">{Number(scan.confidence).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (token) {
                              try {
                                await api.delete(`/history/${scan.id}`);
                                setRecentScans(prev => prev.filter(s => s.id !== scan.id));
                              } catch (err) {
                                console.error('Failed to delete', err);
                              }
                            } else {
                              useStore.getState().removeGuestScan(scan.id);
                              setRecentScans(prev => prev.filter(s => s.id !== scan.id));
                            }
                          }}
                          className="text-gray-500 hover:text-red-400 transition p-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {recentScans.length > 0 && (
              <div className="p-4 border-t border-gray-800 bg-gray-800/20 flex justify-center">
                <button onClick={() => navigate('/history')} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition">
                  View full history →
                </button>
              </div>
            )}
          </div>
        </motion.div>
    </AppShell>
  )
}
