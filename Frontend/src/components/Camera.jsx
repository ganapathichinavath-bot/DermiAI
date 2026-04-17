import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

export default function Camera({ onCapture, onClose }) {
  const videoRef  = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [ready, setReady]       = useState(false)
  const [captured, setCaptured] = useState(null)
  const [error, setError]       = useState(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: 640, height: 480 }
    }).then((stream) => {
      streamRef.current = stream
      videoRef.current.srcObject = stream
      videoRef.current.play()
      setReady(true)
    }).catch((err) => {
      setError(err.name === 'NotAllowedError'
        ? 'Camera permission denied.' : 'Camera not available.')
    })
    return () => streamRef.current?.getTracks().forEach(t => t.stop())
  }, [])

  const capture = useCallback(() => {
    const v = videoRef.current, c = canvasRef.current
    c.width = v.videoWidth; c.height = v.videoHeight
    c.getContext('2d').drawImage(v, 0, 0)
    setCaptured(c.toDataURL('image/jpeg', 0.9))
  }, [])

  const confirm = useCallback(() => {
    canvasRef.current.toBlob((blob) => {
      onCapture(new File([blob], 'capture.jpg', { type: 'image/jpeg' }), captured)
    }, 'image/jpeg', 0.9)
  }, [captured, onCapture])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl overflow-hidden w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h3 className="text-white font-semibold">Camera Capture</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">✕</button>
        </div>
        <div className="bg-black relative">
          {error
            ? <div className="h-64 flex items-center justify-center text-red-400 p-6 text-center">{error}</div>
            : <>
                <video ref={videoRef} className={`w-full ${captured ? 'hidden' : 'block'}`} playsInline muted />
                {captured && <img src={captured} alt="captured" className="w-full" />}
              </>
          }
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="p-4 flex gap-3 justify-center">
          {!captured
            ? <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={capture} disabled={!ready || !!error}
                className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white px-8 py-3 rounded-xl font-semibold">
                📷 Capture
              </motion.button>
            : <>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCaptured(null)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl">Retake</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} onClick={confirm}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold">Use Photo</motion.button>
              </>
          }
        </div>
      </div>
    </motion.div>
  )
}