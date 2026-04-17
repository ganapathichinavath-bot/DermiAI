import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [snapshot, setSnapshot] = useState('')

  useEffect(() => {
    let mounted = true
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      .then((stream) => {
        if (!mounted || !videoRef.current) return
        streamRef.current = stream
        videoRef.current.srcObject = stream
        videoRef.current.play()
      })
      .catch((err) => {
        setError(err?.name === 'NotAllowedError' ? 'Camera permission was denied.' : 'Camera is unavailable in this browser.')
      })

    return () => {
      mounted = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  function captureFrame() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const context = canvas.getContext('2d')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    setSnapshot(canvas.toDataURL('image/jpeg', 0.95))
  }

  function confirmCapture() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onCapture(file, snapshot)
    }, 'image/jpeg', 0.95)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="panel w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Camera capture</p>
            <h3 className="mt-2 text-xl font-semibold text-white">Use the browser camera directly</h3>
          </div>
          <button onClick={onClose} className="button-secondary px-4 py-2">
            Close
          </button>
        </div>
        <div className="p-6">
          {error ? (
            <div className="panel-soft flex min-h-72 items-center justify-center p-8 text-center text-sm text-rose-200">{error}</div>
          ) : (
            <div className="panel-soft overflow-hidden">
              {snapshot ? (
                <img src={snapshot} alt="Captured skin image" className="h-[24rem] w-full object-cover" />
              ) : (
                <video ref={videoRef} muted playsInline className="h-[24rem] w-full object-cover" />
              )}
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
          {!error ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {!snapshot ? (
                <button onClick={captureFrame} className="button-primary">
                  Capture frame
                </button>
              ) : (
                <>
                  <button onClick={() => setSnapshot('')} className="button-secondary">
                    Retake
                  </button>
                  <button onClick={confirmCapture} className="button-primary">
                    Use this image
                  </button>
                </>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}
