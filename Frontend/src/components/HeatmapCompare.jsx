import { assetUrl } from '../api'

export default function HeatmapCompare({ originalUrl, heatmapUrl, split }) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/40">
      <img src={assetUrl(originalUrl)} alt="Original lesion" className="h-[26rem] w-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${split}%` }}>
        <img src={assetUrl(heatmapUrl)} alt="Grad-CAM overlay" className="h-[26rem] w-full object-cover" />
      </div>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `calc(${split}% - 1px)` }}>
        <div className="h-full w-0.5 bg-white/90" />
      </div>
    </div>
  )
}
