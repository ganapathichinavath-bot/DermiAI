import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import useStore from '../store/useStore'

const STEPS = [
  { label: 'Uploading scan…', icon: '⬆️' },
  { label: 'Running AI inference…', icon: '🧠' },
  { label: 'Generating Grad-CAM…', icon: '🔬' },
]

export default function Loading() {
  const navigate = useNavigate()
  const location = useLocation()
  const file = location.state?.file
  const [step, setStep] = useState(0)
  const [error, setError] = useState(null)
  const token = useStore((s) => s.token)

  useEffect(() => {
    if (!file) {
      navigate('/scan', { replace: true })
      return
    }

    let active = true

    const run = async () => {
      // Advance step indicator every 1.8 s while waiting
      const timer = setInterval(() => {
        setStep((p) => Math.min(p + 1, STEPS.length - 1))
      }, 1800)

      try {
        const form = new FormData()
        form.append('file', file)

        const { data: result } = await api.post('/diagnose', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!active) { clearInterval(timer); return }

        clearInterval(timer)
        setStep(STEPS.length - 1)



        setTimeout(() => {
          if (active) navigate('/result', { replace: true, state: { result, originalFile: file } })
        }, 900)
      } catch (err) {
        clearInterval(timer)
        if (active) {
          console.error(err)
          setError('Failed to process scan. Please make sure the backend is running.')
        }
      }
    }

    run()
    return () => { active = false }
  }, [])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[120px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel p-10 max-w-sm w-full text-center relative z-10"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Analysis Failed</h2>
            <p className="text-slate-400 text-sm mb-6">{error}</p>
            <button
              id="loading-retry-btn"
              onClick={() => navigate('/scan')}
              className="button-primary w-full py-3"
            >
              ← Go Back to Scan
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center max-w-sm w-full relative z-10"
          >
            {/* Spinner ring */}
            <div className="relative mb-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
                className="w-28 h-28 rounded-full border-4 border-slate-800 border-t-cyan-400"
                style={{ boxShadow: '0 0 40px rgba(34,211,238,0.2)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-3xl">
                {STEPS[step].icon}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">Analyzing…</h2>
            <p className="text-slate-400 text-sm mb-10">
              Please wait while DermAI processes your image.
            </p>

            {/* Step list */}
            <div className="w-full space-y-3">
              {STEPS.map((s, i) => {
                const isPast = i < step
                const isActive = i === step
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-4"
                  >
                    {/* Circle */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 text-sm font-bold
                        ${isPast
                          ? 'bg-cyan-400 text-[#03111b]'
                          : isActive
                            ? 'border-2 border-cyan-400 text-cyan-400'
                            : 'border-2 border-slate-700 text-slate-600'
                        }`}
                    >
                      {isPast ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-sm font-medium transition-colors duration-500
                        ${isPast || isActive ? 'text-white' : 'text-slate-600'}`}
                    >
                      {s.label}
                    </span>

                    {/* Pulse dot for active */}
                    {isActive && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </motion.div>
                )
              })}
            </div>

            <p className="text-xs text-slate-600 mt-10 text-center">
              Your image is processed securely and not stored without your consent.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
