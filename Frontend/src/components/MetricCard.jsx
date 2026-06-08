import { motion } from 'framer-motion'

export default function MetricCard({ label, value, helper, tone = 'cyan' }) {
  const tones = {
    cyan: 'from-cyan-300/20 to-sky-400/10 text-cyan-100',
    amber: 'from-amber-300/20 to-orange-400/10 text-amber-100',
    rose: 'from-rose-300/20 to-pink-400/10 text-rose-100',
    emerald: 'from-emerald-300/20 to-teal-400/10 text-emerald-100',
  }

  return (
    <motion.div whileHover={{ y: -2 }} className="panel-soft overflow-hidden p-5">
      <div className={`rounded-2xl bg-gradient-to-br p-4 ${tones[tone] || tones.cyan}`}>
        <p className="text-xs uppercase tracking-[0.28em] text-white/70">{label}</p>
        <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        <p className="mt-2 text-sm text-white/75">{helper}</p>
      </div>
    </motion.div>
  )
}
