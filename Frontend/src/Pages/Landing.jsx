import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104A7.5 7.5 0 0112 3c4.142 0 7.5 3.358 7.5 7.5a7.5 7.5 0 01-7.5 7.5 7.5 7.5 0 01-7.5-7.5c0-2.19.94-4.163 2.44-5.547" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l3-3m0 0l-3-3m3 3H9" />
      </svg>
    ),
    title: 'AI-Powered Analysis',
    desc: 'State-of-the-art model with 81% test accuracy and 0.97 Micro AUC, trained on 10,000+ clinical images.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
      </svg>
    ),
    title: 'Instant Camera Capture',
    desc: 'Use your device camera for real-time capture — no app install required.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Explainable Results',
    desc: 'Grad-CAM heatmaps highlight exactly which regions drove the prediction.',
  },
]

const diseases = [
  { code: 'MEL', label: 'Melanoma', color: '#f43f5e' },
  { code: 'NV',  label: 'Melanocytic Nevi', color: '#6366f1' },
  { code: 'BCC', label: 'Basal Cell Carcinoma', color: '#f97316' },
  { code: 'AK',  label: 'Actinic Keratosis', color: '#eab308' },
  { code: 'BKL', label: 'Benign Keratosis', color: '#22c55e' },
  { code: 'DF',  label: 'Dermatofibroma', color: '#06b6d4' },
  { code: 'VASC',label: 'Vascular Lesions', color: '#ec4899' },
]

export default function Landing() {
  const navigate = useNavigate()
  const user = useStore((state) => state.user)

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'var(--bg)' }}>
      {/* ── Navbar ── */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 hover:opacity-80 transition"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <span className="text-xs font-black text-white">D</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">DermAI</span>
        </button>
        <div className="flex items-center gap-3">
          {!user && (
            <button
              id="nav-login-btn"
              onClick={() => navigate('/login')}
              className="button-secondary text-sm px-4 py-2"
            >
              Sign In
            </button>
          )}
          <button
            id="nav-start-btn"
            onClick={() => navigate('/scan')}
            className="button-primary text-sm px-4 py-2"
          >
            Start Scan
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-24">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-sky-600/8 blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-3xl"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-sm font-medium mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            DermAI v1.0 — Production Ready
          </motion.span>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
            Skin Disease
            <span className="block bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
              Detection
            </span>
            in Seconds
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Upload or capture a photo of a skin lesion. Our deep-learning model identifies
            7 conditions with Grad-CAM explainability — free, instant, in-browser.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.button
              id="hero-start-btn"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/scan')}
              className="button-primary px-8 py-4 text-base shadow-2xl shadow-cyan-500/25"
            >
              Start Scanning →
            </motion.button>
            {!user && (
              <motion.button
                id="hero-login-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="button-secondary px-8 py-4 text-base"
              >
                Sign In
              </motion.button>
            )}
          </div>

          <p className="mt-4 text-xs text-slate-600">
            No account required · For educational use only · Not a medical diagnosis
          </p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
            className="w-4 h-7 rounded-full border border-slate-700 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-slate-600" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white text-center mb-4"
        >
          Everything you need
        </motion.h2>
        <p className="text-slate-400 text-center mb-12">Clinical-grade explainability right in your browser.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="panel p-6 group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-sky-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-300 mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/10 transition-shadow">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Diseases supported ── */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl font-bold text-white text-center mb-10"
        >
          7 Conditions Detected
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-3">
          {diseases.map((d, i) => (
            <motion.span
              key={d.code}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="px-4 py-2 rounded-full text-sm font-medium border"
              style={{
                borderColor: `${d.color}33`,
                background: `${d.color}11`,
                color: d.color,
              }}
            >
              {d.code} · {d.label}
            </motion.span>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="panel max-w-2xl mx-auto p-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Ready to scan?</h2>
          <p className="text-slate-400 mb-8">Upload or capture a photo in under a minute.</p>
          <motion.button
            id="cta-start-btn"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/scan')}
            className="button-primary px-8 py-4 text-base shadow-2xl shadow-cyan-500/25"
          >
            Start Scanning Now →
          </motion.button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-slate-600 text-xs border-t border-white/5">
        © {new Date().getFullYear()} DermAI · For educational purposes only. Not a substitute for professional medical advice.
      </footer>
    </div>
  )
}
