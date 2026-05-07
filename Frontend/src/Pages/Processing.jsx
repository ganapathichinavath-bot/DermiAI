import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api'
import useStore from '../store/useStore'

const steps = [
  "Uploading scan...",
  "Processing deeply...",
  "Generating Explainability..."
]

export default function Processing() {
  const navigate = useNavigate()
  const location = useLocation()
  const file = location.state?.file
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState(null)
  const token = useStore((s) => s.token)

  useEffect(() => {
    if (!file) {
      navigate('/scan', { replace: true })
      return
    }

    let isSubscribed = true

    const processUpload = async () => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        
        // Progress step timer simulating pipeline phases
        const stepTimer = setInterval(() => {
          setCurrentStep(prev => Math.min(prev + 1, 2))
        }, 1500)

        const response = await api.post('/diagnose', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        if (!isSubscribed) {
          clearInterval(stepTimer)
          return
        }

        clearInterval(stepTimer)
        setCurrentStep(2) // Force final step
        
        const result = response.data

        setTimeout(() => {
          if (isSubscribed) {
            navigate('/result', { replace: true, state: { result, originalFile: file } })
          }
        }, 1200)

      } catch (err) {
        if (isSubscribed) {
          console.error(err)
          setError("Failed to process scan. Please ensure the backend is running.")
        }
      }
    }

    processUpload()

    return () => {
      isSubscribed = false
    }
  }, [file, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B0F19] p-6 text-white overflow-hidden relative">
      {error ? (
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={() => navigate('/scan')} className="btn-primary">Go Back</button>
        </div>
      ) : (
        <div className="max-w-md w-full relative z-10 flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-24 h-24 mb-12 border-4 border-gray-800 border-t-[#6366F1] rounded-full"
          />
          
          <div className="w-full space-y-4">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;
              
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${isPast ? 'bg-[#6366F1] text-white' : isActive ? 'border-2 border-[#6366F1] text-[#6366F1]' : 'border-2 border-gray-800 text-gray-700'}`}>
                    {isPast ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium transition-colors duration-500 ${isPast || isActive ? 'text-white' : 'text-gray-600'}`}>
                      {step}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
