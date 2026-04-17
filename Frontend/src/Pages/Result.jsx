import { Link, Navigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import ConfidenceBar from '../components/ConfidenceBar'
import useStore from '../store/useStore'
import { assetUrl } from '../api'

const riskTone = {
  Malignant: 'border-rose-400/20 bg-rose-400/10 text-rose-100',
  Precancerous: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  Benign: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  'Usually benign': 'border-cyan-400/20 bg-cyan-400/10 text-cyan-100',
}

export default function Result() {
  const scan = useStore((state) => state.activeScan)

  if (!scan) {
    return <Navigate to="/scan" replace />
  }

  return (
    <AppShell
      eyebrow="Classification result"
      title={scan.prediction_name}
      description="Review the predicted class, confidence profile, and risk framing before opening the explainability view."
      actions={
        <>
          <Link to="/explain" className="button-primary">
            Open Grad-CAM view
          </Link>
          <Link to="/scan" className="button-secondary">
            Run another scan
          </Link>
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="panel overflow-hidden">
          <img src={assetUrl(scan.original_url)} alt={scan.prediction_name} className="h-[32rem] w-full object-cover" />
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Prediction summary</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`pill ${riskTone[scan.risk] || riskTone.Benign}`}>{scan.risk}</span>
              <span className="pill border-white/10 bg-white/5 text-slate-300">{scan.risk_level} risk tier</span>
            </div>
            <div className="mt-6">
              <p className="text-5xl font-semibold text-white">{Number(scan.confidence).toFixed(1)}%</p>
              <p className="mt-2 text-sm text-slate-400">Confidence for the highest-ranked class</p>
            </div>
          </div>

          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Top predictions</p>
            <div className="mt-5 space-y-5">
              {scan.top3?.map((item, index) => (
                <ConfidenceBar key={item.class} label={`${index + 1}. ${item.name}`} value={Number(item.confidence)} muted={index > 0} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
