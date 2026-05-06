import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/AppShell'
import { assetUrl } from '../api'

export default function Explain() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = location.state?.result
  const originalFile = location.state?.originalFile
  
  const [activeTab, setActiveTab] = useState('gradcam')
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!result) {
      navigate('/scan')
    }
  }, [result, navigate])

  if (!result) return null

  const heatmapUrl = assetUrl(result.heatmap_url)
  const saliencyUrl = result.saliency_url ? assetUrl(result.saliency_url) : heatmapUrl
  const originalUrl = originalFile ? URL.createObjectURL(originalFile) : (result.original_url ? assetUrl(result.original_url) : heatmapUrl) // Fallback if lost

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }

  const handleTouchMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.touches[0].clientX - rect.left, rect.width))
    setSliderPos((x / rect.width) * 100)
  }

  const tabs = [
    { id: 'gradcam', label: 'Grad-CAM', desc: 'Shows where the model looked to make its prediction.' },
    { id: 'saliency', label: 'Saliency Map', desc: 'Highlights pixel-level sensitivity to the diagnosis.' },
    { id: 'compare', label: 'Compare', desc: 'Drag the slider to compare original with AI attention.' }
  ]

  return (
    <AppShell
      eyebrow="Explainable AI"
      title="Explain"
      description={`Understand which regions influenced the ${result.prediction} prediction.`}
      actions={
        <button onClick={() => navigate(-1)} className="button-secondary">
          Back
        </button>
      }
    >

        {/* Custom Tabs */}
        <div className="flex p-1 bg-gray-800/40 rounded-xl w-full sm:w-auto self-start mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="explain_tab_bg"
                  className="absolute inset-0 bg-[#6366F1] rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Image Display Area */}
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-4 sm:p-8 flex flex-col relative overflow-hidden flex-1 min-h-[400px]">
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center mb-6"
            >
              <p className="text-gray-300 font-medium">{tabs.find(t => t.id === activeTab)?.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex-1 w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black/60 relative shadow-2xl flex items-center justify-center">
            
            {activeTab === 'gradcam' && (
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={heatmapUrl} 
                alt="Grad-CAM" 
                className="w-full h-full object-contain max-h-[60vh]"
              />
            )}

            {activeTab === 'saliency' && (
              <motion.img 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={saliencyUrl} 
                alt="Saliency Map" 
                className="w-full h-full object-contain max-h-[60vh]"
              />
            )}

            {activeTab === 'compare' && (
              <div 
                ref={containerRef}
                className="relative w-full h-full max-h-[60vh] select-none cursor-ew-resize group"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                {/* Under image (Grad-CAM) */}
                <img 
                  src={heatmapUrl} 
                  alt="Grad-CAM" 
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                />
                
                {/* Over image (Original) masked by slider */}
                <div 
                  className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img 
                    src={originalUrl} 
                    alt="Original" 
                    className="absolute inset-0 w-[100vw] max-w-3xl h-full object-contain pointer-events-none origin-left"
                    style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%' }}
                  />
                </div>

                {/* Slider Handle */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transform -translate-x-1/2 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6366F1]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </AppShell>
  )
}
