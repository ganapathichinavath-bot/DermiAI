import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import HeatmapCompare from '../components/HeatmapCompare'
import useStore from '../store/useStore'

export default function Explain() {
  const scan = useStore((state) => state.activeScan)
  const [split, setSplit] = useState(55)

  if (!scan) {
    return <Navigate to="/scan" replace />
  }

  return (
    <AppShell
      eyebrow="Explainability"
      title="Grad-CAM attention overlay"
      description="The heatmap is generated from gradients flowing through the final convolutional layer, highlighting regions that most influenced the prediction."
      actions={
        <>
          <Link to="/result" className="button-secondary">
            Back to result
          </Link>
          <Link to="/history" className="button-primary">
            View history
          </Link>
        </>
      }
    >
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="panel p-6">
          <HeatmapCompare originalUrl={scan.original_url} heatmapUrl={scan.heatmap_url} split={split} />
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>Original image</span>
              <span>Grad-CAM overlay</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={split}
              onChange={(event) => setSplit(Number(event.target.value))}
              className="mt-4 w-full accent-cyan-300"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Interpretation</p>
            <div className="mt-4 space-y-4">
              {scan.explanation?.map((line) => (
                <div key={line} className="panel-soft p-4 text-sm leading-7 text-slate-300">
                  {line}
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Clinical note</p>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              This application is for educational and triage support only. It does not replace a dermatologist, biopsy, or clinical examination.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  )
}
