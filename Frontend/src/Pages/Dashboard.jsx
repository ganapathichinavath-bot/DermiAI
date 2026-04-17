import { Link } from 'react-router-dom'
import AppShell from '../components/AppShell'
import MetricCard from '../components/MetricCard'
import useStore from '../store/useStore'
import { assetUrl } from '../api'

function computeMetrics(scans) {
  const total = scans.length
  const averageConfidence = total
    ? scans.reduce((sum, scan) => sum + Number(scan.confidence || 0), 0) / total
    : 0
  const highRisk = scans.filter((scan) => scan.risk_level === 'High').length
  const savedMode = scans.some((scan) => scan.id) ? 'Cloudless account mode' : 'Guest local mode'

  return { total, averageConfidence, highRisk, savedMode }
}

export default function Dashboard() {
  const guestHistory = useStore((state) => state.guestHistory)
  const activeScan = useStore((state) => state.activeScan)
  const scans = activeScan ? [activeScan, ...guestHistory.filter((item) => item.created_at !== activeScan.created_at)] : guestHistory
  const metrics = computeMetrics(scans)

  return (
    <AppShell
      eyebrow="AI-powered screening"
      title="Skin disease diagnosis dashboard"
      description="Upload an image or use the device camera, inspect confidence and risk, then review the Grad-CAM attention map to understand what influenced the prediction."
      actions={
        <>
          <Link to="/scan" className="button-primary">
            Start new scan
          </Link>
          <Link to="/history" className="button-secondary">
            Open history
          </Link>
        </>
      }
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Scans processed" value={metrics.total} helper="Guest and current-session scans" tone="cyan" />
        <MetricCard label="Average confidence" value={`${metrics.averageConfidence.toFixed(1)}%`} helper="Across visible history" tone="emerald" />
        <MetricCard label="High-risk results" value={metrics.highRisk} helper="Classes marked malignant or equivalent" tone="rose" />
        <MetricCard label="Storage mode" value={metrics.savedMode} helper="SQLite when signed in, localStorage otherwise" tone="amber" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Recent scans</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Latest diagnostic outputs</h2>
            </div>
            <Link to="/history" className="text-sm text-cyan-200 hover:text-white">
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {scans.length ? (
              scans.slice(0, 4).map((scan) => (
                <div key={`${scan.created_at}-${scan.prediction}`} className="panel-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <img src={assetUrl(scan.original_url)} alt={scan.prediction_name} className="h-20 w-full rounded-2xl object-cover sm:w-24" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">{scan.prediction_name}</h3>
                      <span className="pill border-white/10 bg-white/5 text-slate-300">{scan.risk}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                      Confidence {Number(scan.confidence).toFixed(1)}%{scan.created_at ? ` • ${new Date(scan.created_at).toLocaleString()}` : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="panel-soft p-5 text-sm leading-7 text-slate-400">
                No scans yet. Start with an upload or camera capture and the dashboard will begin tracking results right away.
              </div>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Workflow</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">How the system works</h2>
          <div className="mt-6 space-y-4">
            {[
              'Acquire an image from file upload or live device camera.',
              'FastAPI stores the upload locally and runs PyTorch inference.',
              'Real Grad-CAM computes attention over the final convolutional layer.',
              'Result and explainability views expose confidence, top alternatives, and heatmap evidence.',
            ].map((step, index) => (
              <div key={step} className="panel-soft flex gap-4 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                  {index + 1}
                </div>
                <p className="text-sm leading-7 text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  )
}
