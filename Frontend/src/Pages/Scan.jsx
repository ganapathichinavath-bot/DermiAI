import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell'
import CameraCapture from '../components/CameraCapture'
import useStore from '../store/useStore'

export default function Scan() {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const setSelectedImage = useStore((state) => state.setSelectedImage)
  const clearProcessingState = useStore((state) => state.clearProcessingState)
  const [preview, setPreview] = useState('')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)

  function chooseFile(file, fallbackPreview) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.')
      return
    }

    clearProcessingState()
    setError('')
    const previewUrl = fallbackPreview || URL.createObjectURL(file)
    setPreview(previewUrl)
    setSelectedImage({ file, previewUrl, name: file.name, capturedAt: new Date().toISOString() })
  }

  function handleStart() {
    if (!preview) {
      setError('Add an image before continuing.')
      return
    }
    navigate('/processing')
  }

  return (
    <>
      <AppShell
        eyebrow="Acquisition"
        title="Capture or upload a lesion image"
        description="Use a high-resolution close-up with even lighting. The app supports both browser camera capture and standard file upload without any third-party services."
        actions={
          <>
            <button onClick={() => inputRef.current?.click()} className="button-primary">
              Upload image
            </button>
            <button onClick={() => setCameraOpen(true)} className="button-secondary">
              Open camera
            </button>
          </>
        }
      >
        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            whileHover={{ y: -2 }}
            onDragOver={(event) => {
              event.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setDragging(false)
              chooseFile(event.dataTransfer.files?.[0])
            }}
            onClick={() => inputRef.current?.click()}
            className={`panel flex min-h-[24rem] cursor-pointer items-center justify-center p-6 transition ${dragging ? 'ring-2 ring-cyan-300/40' : ''}`}
          >
            {preview ? (
              <img src={preview} alt="Selected scan" className="h-[24rem] w-full rounded-[1.75rem] object-cover" />
            ) : (
              <div className="max-w-md text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Dropzone</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Drag a scan here or click to browse</h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">
                  Supported formats: JPG, PNG, WEBP. For best results, keep the lesion centered with sharp focus and minimal background clutter.
                </p>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
          </motion.div>

          <div className="space-y-6">
            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Tips</p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
                <p>Use diffuse lighting and avoid heavy shadows.</p>
                <p>Fill most of the frame with the skin region you want analyzed.</p>
                <p>Retake blurry photos before running inference.</p>
              </div>
            </div>

            <div className="panel p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Status</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{preview ? 'Ready to analyze' : 'Waiting for an image'}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                {preview
                  ? 'The selected image is staged in browser memory and will be sent to the FastAPI backend when you continue.'
                  : 'Once an image is selected, the processing page will upload it and walk through preprocessing, feature extraction, classification, and Grad-CAM generation.'}
              </p>
              {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={handleStart} className="button-primary">
                  Analyze image
                </button>
                <Link to="/" className="button-secondary">
                  Back to dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AppShell>

      {cameraOpen ? <CameraCapture onCapture={(file, previewUrl) => {
        chooseFile(file, previewUrl)
        setCameraOpen(false)
      }} onClose={() => setCameraOpen(false)} /> : null}
    </>
  )
}
