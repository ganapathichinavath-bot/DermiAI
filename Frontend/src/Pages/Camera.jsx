import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const tips = [
  { icon: '💡', title: 'Lighting', desc: 'Use bright, even natural light. Avoid harsh shadows or flash glare.' },
  { icon: '🔍', title: 'Focus', desc: 'Hold the camera 10–15 cm from the lesion. Keep it still until it locks focus.' },
  { icon: '📐', title: 'Framing', desc: 'Center the lesion with a small margin around it.' },
  { icon: '🎨', title: 'No Filters', desc: 'Disable beauty or skin-smoothing filters that distort texture.' },
]

export default function Camera() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16" style={{ background: 'var(--bg)' }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <button
          id="camera-info-back-btn"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition text-sm mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-sky-500/10 border border-cyan-400/20 items-center justify-center mb-4 text-3xl">
            📸
          </div>
          <h1 className="text-3xl font-bold text-white">Photo Tips</h1>
          <p className="mt-2 text-slate-400 text-sm">Follow these guidelines for the most accurate AI result.</p>
        </div>

        <div className="space-y-4 mb-10">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="panel p-5 flex items-start gap-4"
            >
              <span className="text-2xl mt-0.5 shrink-0">{tip.icon}</span>
              <div>
                <h3 className="font-semibold text-white">{tip.title}</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/8 p-4 text-xs text-amber-300/80 text-center mb-8">
          ⚠️ DermAI is for <strong>educational purposes only</strong>. Always consult a qualified dermatologist.
        </div>

        <motion.button
          id="camera-info-proceed-btn"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/camera-capture')}
          className="button-primary w-full py-4 text-base shadow-2xl shadow-cyan-500/20"
        >
          I'm ready — Open Camera →
        </motion.button>

        <button
          id="camera-info-upload-btn"
          onClick={() => navigate('/scan')}
          className="button-secondary w-full py-3 mt-3 text-sm"
        >
          Or upload an existing image instead
        </button>
      </motion.div>
    </div>
  )
}
