import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function CameraCapture() {
  const navigate = useNavigate()
  const setSelectedImage = useStore((s) => s.setSelectedImage)
  const resetProcessingState = useStore((s) => s.resetProcessingState)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [captured, setCaptured] = useState(null) // blob URL of captured frame
  const [capturedFile, setCapturedFile] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  async function startCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => setCameraReady(true)
      }
    } catch {
      setError('Camera access denied or not available on this device.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }

  function capturePhoto() {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
        const url = URL.createObjectURL(blob)
        setCaptured(url)
        setCapturedFile(file)
        stopCamera()
      },
      'image/jpeg',
      0.95,
    )
  }

  function retake() {
    if (captured) URL.revokeObjectURL(captured)
    setCaptured(null)
    setCapturedFile(null)
    startCamera()
  }

  function usePhoto() {
    if (!capturedFile) return
    resetProcessingState()
    setSelectedImage({ file: capturedFile, previewUrl: captured, capturedAt: new Date().toISOString() })
    navigate('/loading', { state: { file: capturedFile } })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="camera-capture-back-btn"
            onClick={() => navigate('/camera-info')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-lg font-semibold text-white">Camera Capture</h1>
          <div className="w-16" />
        </div>

        {/* Viewfinder / Preview */}
        <div className="panel overflow-hidden mb-6 relative">
          <AnimatePresence mode="wait">
            {captured ? (
              <motion.img
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                src={captured}
                alt="Captured lesion"
                className="w-full aspect-video object-cover"
              />
            ) : (
              <motion.div key="video" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video object-cover"
                />
                {/* Guide overlay */}
                {cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-44 h-44 rounded-full border-2 border-dashed border-cyan-400/50 shadow-[0_0_40px_rgba(34,211,238,0.15)]" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!cameraReady && !captured && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-10 h-10 border-2 border-gray-700 border-t-cyan-400 rounded-full"
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200 text-center">
            {error}
          </div>
        )}

        {/* Controls */}
        {captured ? (
          <div className="grid grid-cols-2 gap-4">
            <button id="camera-retake-btn" onClick={retake} className="button-secondary py-3">
              ↺ Retake
            </button>
            <motion.button
              id="camera-use-photo-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={usePhoto}
              className="button-primary py-3 shadow-xl shadow-cyan-500/20"
            >
              Use this photo →
            </motion.button>
          </div>
        ) : (
          <div className="flex justify-center">
            <motion.button
              id="camera-capture-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-cyan-500/30 flex items-center justify-center transition"
            >
              <div className="w-14 h-14 rounded-full border-4 border-white/30 bg-white/10" />
            </motion.button>
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-6">
          Images stay in-browser memory. Nothing is uploaded until you click Analyze.
        </p>
      </motion.div>
    </div>
  )
}
