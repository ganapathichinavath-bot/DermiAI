import { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import api, { assetUrl } from '../api'
import useStore from '../store/useStore'
import AppShell from '../components/AppShell'

export default function History() {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const token = useStore((s) => s.token)
  const guestHistory = useStore((s) => s.guestHistory)

  useEffect(() => {
    let mounted = true
    
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    async function load() {
      setLoading(true)
      try {
        const res = await api.get('/history')
        if (mounted) setHistory(res.data)
      } catch {
        if (mounted) setHistory([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    
    return () => {
      mounted = false
    }
  }, [token, navigate])

  return (
    <AppShell
      eyebrow="Saved scans"
      title="History"
      description="Your authenticated scan history stored securely in the cloud."
      actions={
        <button onClick={() => navigate('/scan')} className="button-primary">
          New Scan
        </button>
      }
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="panel overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-16 text-center">
            <p className="text-xl text-gray-300 font-medium mb-2">No history found</p>
            <p className="text-gray-500">Your past scans will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-800/80 border-b border-gray-700">
                  <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Image / ID</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Prediction</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Confidence</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((record, i) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    key={record.id} 
                    onClick={() => navigate('/explain', { state: { result: record } })}
                    className="hover:bg-gray-800/30 transition cursor-pointer group"
                  >
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-900 border border-white/10 shrink-0">
                          <img src={record.original_url ? assetUrl(record.original_url) : 'https://via.placeholder.com/150'} alt="scan" className="w-full h-full object-cover" />
                        </div>
                        <div className="font-mono text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded inline-block">
                          #{String(record.id).substring(0,6)}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-white">{record.prediction}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-800 rounded-full h-2 max-w-[60px]">
                          <div className="bg-[#6366F1] h-2 rounded-full" style={{ width: `${record.confidence}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-300">{Number(record.confidence).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(record.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (token) {
                            try {
                              await api.delete(`/history/${record.id}`);
                              setHistory(prev => prev.filter(s => s.id !== record.id));
                            } catch (err) {
                              console.error('Failed to delete', err);
                            }
                          } else {
                            useStore.getState().removeGuestScan(record.id);
                            setHistory(prev => prev.filter(s => s.id !== record.id));
                          }
                        }}
                        className="text-gray-500 hover:text-red-400 transition p-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppShell>
  )
}
