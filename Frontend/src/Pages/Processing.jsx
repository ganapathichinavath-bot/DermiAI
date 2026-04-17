import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import api from '../api'
import useStore from '../store/useStore'

const steps = [
  { title: 'Preprocessing', detail: 'Normalizing image tensors and validating upload integrity.' },
  { title: 'Feature extraction', detail: 'Running convolutional passes over the lesion image.' },
  { title: 'Classification', detail: 'Computing softmax confidence and top alternatives.' },
  { title: 'Grad-CAM', detail: 'Backpropagating attention through the final convolutional layer.' },
]

export default function Processing() {
  const navigate = useNavigate()
  const selectedImage = useStore((state) => state.selectedImage)
  const token = useStore((state) => state.token)
  const setActiveScan = useStore((state) => state.setActiveScan)
  const addGuestScan = useStore((state) => state.addGuestScan)
  const processingStep = useStore((state) => state.processingStep)
  const setProcessingStep = useStore((state) => state.setProcessingStep)
  const processingError = useStore((state) => state.processingError)
  const setProcessingError = useStore((state) => state.setProcessingError)
  const [isUploading, setIsUploading] = useState(false)

  const currentStep = useMemo(() => Math.min(processingStep, steps.length - 1), [processingStep])

  useEffect(() => {
    if (!selectedImage?.file) {
      navigate('/scan', { replace: true })
      return
    }

    let cancelled = false
    let ticker = 0

    async function processScan() {
      setIsUploading(true)
      setProcessingError(null)
      setProcessingStep(0)

      ticker = window.setInterval(() => {
        useStore.setState((state) => ({ processingStep: Math.min(state.processingStep + 1, steps.length - 1) }))
      }, 1200)

      try {
        const formData = new FormData()
        formData.append('file', selectedImage.file)
        const response = await api.post('/predict', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (cancelled) return

        const scan = {
          ...response.data,
          created_at: response.data.created_at || new Date().toISOString(),
        }
        setActiveScan(scan)
        if (!token) {
          addGuestScan(scan)
        }

        window.clearInterval(ticker)
        setProcessingStep(steps.length - 1)
        window.setTimeout(() => navigate('/result', { replace: true }), 450)
      } catch (error) {
        if (cancelled) return
        window.clearInterval(ticker)
        setProcessingError(error?.response?.data?.detail || 'The API request failed. Check the backend and try again.')
      } finally {
        if (!cancelled) {
          setIsUploading(false)
        }
      }
    }

    processScan()

    return () => {
      cancelled = true
      window.clearInterval(ticker)
    }
  }, [selectedImage, navigate, setActiveScan, addGuestScan, token, setProcessingError, setProcessingStep])

  return (
    <AppShell
      eyebrow="Inference pipeline"
      title="Processing diagnostic scan"
      description="This page stages the upload, runs the model, and computes a real Grad-CAM overlay before routing to the result screen."
    >
      <section className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="panel p-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const state = index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending'
              return (
                <div key={step.title} className="panel-soft flex items-start gap-4 p-4">
                  <div
                    className={[
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold',
                      state === 'complete'
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : state === 'active'
                          ? 'bg-cyan-300/15 text-cyan-100'
                          : 'bg-white/5 text-slate-400',
                    ].join(' ')}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">{step.title}</h2>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{step.detail}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="panel p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Runtime status</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {processingError ? 'Processing stopped' : isUploading ? 'Model is running' : 'Wrapping up'}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            {processingError
              ? processingError
              : 'The stepper is synced to the expected inference stages while the backend processes the uploaded image.'}
          </p>
          <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-sky-400 transition-all duration-700"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </section>
    </AppShell>
  )
}
