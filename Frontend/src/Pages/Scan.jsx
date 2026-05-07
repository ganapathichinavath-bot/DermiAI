import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppShell from '../components/AppShell'
import useStore from '../store/useStore'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function Scan() {
  const navigate = useNavigate()
  const setSelectedImage = useStore((state) => state.setSelectedImage)
  const clearSelectedImage = useStore((state) => state.clearSelectedImage)
  const resetProcessingState = useStore((state) => state.resetProcessingState)

  const [previewUrl, setPreviewUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [previewUrl])

  function selectFile(file) {
    if (!file || !ACCEPTED_TYPES.includes(file.type)) {
      setError('Please choose a JPEG, PNG, or WEBP image.')
      return
    }

    resetProcessingState()
    clearSelectedImage()
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setSelectedFile(file)
    setSelectedImage({ file, previewUrl: localUrl, capturedAt: new Date().toISOString() })
    setError('')
  }

  async function openCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })
      streamRef.current = stream
      setCameraOpen(true)
      setError('')
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (_error) {
      setError('Camera access was denied or unavailable on this device.')
    }
  }

  function closeCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }

  function capturePhoto() {
    if (!videoRef.current || !cameraOpen) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      
      // Use the actual video track dimensions for highest quality
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error("Could not get canvas context");
      
      // Draw frame
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Could not capture image.");
            return;
          }
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          selectFile(file);
          closeCamera();
        },
        'image/jpeg',
        0.95,
      );
    } catch (err) {
      console.error("Capture failed:", err);
      setError("Failed to capture photo.");
    }
  }

  return (
    <AppShell
      eyebrow="Scan Intake"
      title="New Scan"
      description="Upload an image or capture one directly in the browser. We keep the input in memory until you send it to the FastAPI service."
      actions={null}
    >
      <section className="flex justify-center">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="panel p-6 max-w-2xl w-full">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Input source</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Upload or capture</h2>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => selectFile(event.target.files?.[0])}
            />
          </div>

          {cameraOpen ? (
            <div className="mt-6 space-y-4">
              <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full rounded-[1.5rem] object-cover border border-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <button onClick={capturePhoto} className="button-primary">
                  Capture Photo
                </button>
                <button onClick={closeCamera} className="button-secondary">
                  Close Camera
                </button>
              </div>
            </div>
          ) : previewUrl ? (
            <div className="mt-6 space-y-4">
              <img src={previewUrl} alt="Selected lesion" className="aspect-square w-full max-h-[500px] rounded-[1.5rem] object-contain bg-black/40 border border-white/10" />
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => navigate('/loading', { state: { file: selectedFile } })}
                  className="button-primary w-full shadow-xl shadow-cyan-500/20"
                >
                  Analyze Image →
                </button>
                <button
                  onClick={() => {
                    clearSelectedImage()
                    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
                    setPreviewUrl('')
                    setSelectedFile(null)
                    setError('')
                  }}
                  className="button-secondary w-full"
                >
                  Reset
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                onDragOver={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  setIsDragging(false)
                  selectFile(event.dataTransfer.files?.[0])
                }}
                onClick={() => fileInputRef.current?.click()}
                className={[
                  'mt-6 flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed p-8 text-center transition',
                  isDragging ? 'border-cyan-300/60 bg-cyan-300/6' : 'border-white/10 bg-white/3 hover:border-white/20 hover:bg-white/5',
                ].join(' ')}
              >
                <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-cyan-300/20 to-sky-400/10" />
                <h3 className="mt-6 text-2xl font-semibold text-white">Drop lesion image here</h3>
                <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
                  Supports JPEG, PNG, and WEBP. Choose a clear, well-lit close-up for the best Grad-CAM alignment.
                </p>
                <button type="button" className="button-secondary mt-6">
                  Browse Files
                </button>
              </div>

              <div className="mt-6">
                <button onClick={openCamera} className="button-primary w-full">
                  Open Camera
                </button>
              </div>
            </>
          )}

          {error ? <p className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">{error}</p> : null}
        </motion.div>
      </section>
    </AppShell>
  )
}
