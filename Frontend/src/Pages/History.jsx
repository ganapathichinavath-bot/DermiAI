import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import api, { assetUrl } from '../api'
import useStore from '../store/useStore'

export default function History() {
  const token = useStore((state) => state.token)
  const guestHistory = useStore((state) => state.guestHistory)
  const [serverHistory, setServerHistory] = useState([])
  const [status, setStatus] = useState('')

  useEffect(() => {
    let active = true
    if (!token) {
      setServerHistory([])
      return
    }

    setStatus('Loading saved scans...')
    api.get('/history')
      .then((response) => {
        if (!active) return
        setServerHistory(response.data)
        setStatus('')
      })
      .catch(() => {
        if (!active) return
        setStatus('Unable to load saved history from the backend.')
      })

    return () => {
      active = false
    }
  }, [token])

  const scans = token ? serverHistory : guestHistory

  return (
    <AppShell
      eyebrow="Audit trail"
      title="Past scan history"
      description="Guests keep scan history in localStorage. Signed-in users also persist results in SQLite through the FastAPI backend."
    >
      <section className="panel p-6">
        {status ? <p className="mb-4 text-sm text-slate-400">{status}</p> : null}
        {scans.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.25em] text-slate-500">
                <tr>
                  <th className="pb-4">Image</th>
                  <th className="pb-4">Prediction</th>
                  <th className="pb-4">Confidence</th>
                  <th className="pb-4">Risk</th>
                  <th className="pb-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scans.map((scan) => (
                  <tr key={`${scan.created_at}-${scan.prediction}`} className="align-middle">
                    <td className="py-4 pr-4">
                      <img src={assetUrl(scan.original_url)} alt={scan.prediction_name} className="h-16 w-16 rounded-2xl object-cover" />
                    </td>
                    <td className="py-4 pr-4 text-slate-100">{scan.prediction_name}</td>
                    <td className="py-4 pr-4 text-slate-300">{Number(scan.confidence).toFixed(1)}%</td>
                    <td className="py-4 pr-4 text-slate-300">{scan.risk}</td>
                    <td className="py-4 text-slate-400">{scan.created_at ? new Date(scan.created_at).toLocaleString() : 'Session only'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm leading-7 text-slate-400">No stored scans yet. Analyze an image and the history table will populate automatically.</p>
        )}
      </section>
    </AppShell>
  )
}
