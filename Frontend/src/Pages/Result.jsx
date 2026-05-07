import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import AppShell from '../components/AppShell'

export default function Result() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = location.state?.result
  
  useEffect(() => {
    if (!result) {
      navigate('/scan')
    }
  }, [result, navigate])

  if (!result) return null

  // Calculate colors based on risk
  let riskColor = 'text-green-400'
  let riskBg = 'bg-green-500/10'
  let riskBorder = 'border-green-500/20'
  let circleColor = '#34d399' // emerald-400

  const isUnrelated = result.prediction_code === 'unrelated'

  if (isUnrelated) {
    riskColor = 'text-yellow-400'
    riskBg = 'bg-yellow-500/10'
    riskBorder = 'border-yellow-500/20'
    circleColor = '#fbbf24' // yellow-400
  } else if (result.risk_level?.toLowerCase() === 'high' || result.risk_level === 'Malignant') {
    riskColor = 'text-rose-400'
    riskBg = 'bg-rose-500/10'
    riskBorder = 'border-rose-500/20'
    circleColor = '#fb7185' // rose-400
  } else if (result.risk_level?.toLowerCase() === 'moderate' || result.risk_level === 'Precancerous') {
    riskColor = 'text-orange-400'
    riskBg = 'bg-orange-500/10'
    riskBorder = 'border-orange-500/20'
    circleColor = '#fb923c' // orange-400
  }

  // Animation variants
  const circleOffset = 283 - (283 * result.confidence) / 100

  return (
    <AppShell
      eyebrow="Classification result"
      title="Result"
      description={isUnrelated ? "We couldn't identify a clear skin lesion in this image." : "Review the predicted condition, confidence, and the top differential diagnoses."}
      actions={
        <button onClick={() => navigate('/scan')} className="button-secondary">
          New scan
        </button>
      }
    >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border ${riskColor} ${riskBg} ${riskBorder}`}>
            {result.risk_level || 'Unknown Risk'}
          </div>
          
          <h1 className="text-5xl font-extrabold text-white tracking-tight mb-2">
            {result.prediction}
          </h1>
          <p className="text-gray-400">
            {isUnrelated 
              ? "Please provide a clear, well-lit close-up of a skin lesion." 
              : "Primary detection based on deep learning analysis"}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Confidence Circle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#111827] rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-8">
              {isUnrelated ? 'Match Score' : 'Model Confidence'}
            </h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Background circle */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
                <motion.circle 
                  cx="96" cy="96" r="45" 
                  fill="none" 
                  stroke={circleColor} 
                  strokeWidth="8" 
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: circleOffset }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="text-center">
                <span className="text-4xl font-extrabold text-white">{Math.round(result.confidence)}</span>
                <span className="text-xl text-gray-500 font-medium">%</span>
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </motion.div>

          {/* Top 3 Predictions / Info */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#111827] rounded-3xl p-8 border border-white/5 flex flex-col"
          >
            <h3 className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">
              {isUnrelated ? 'Why this happened?' : 'Differential Diagnosis'}
            </h3>
            
            <div className="space-y-5 flex-1 flex flex-col justify-center">
              {isUnrelated ? (
                <div className="text-slate-400 text-sm space-y-4">
                  <p>Our AI model is specialized specifically for human skin lesions. This image didn't match the expected patterns because:</p>
                  <ul className="list-disc list-inside space-y-2 text-slate-300">
                    <li>The photo might be too blurry or dark.</li>
                    <li>The subject is not a skin condition.</li>
                    <li>The camera was too far away.</li>
                  </ul>
                </div>
              ) : (
                result.top3 && result.top3.map((pred, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className={`font-semibold ${index === 0 ? 'text-white' : 'text-gray-400'}`}>{pred.name}</span>
                      <span className={index === 0 ? 'text-indigo-400 font-bold' : 'text-gray-500'}>{pred.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.value}%` }} 
                        transition={{ duration: 1, delay: 0.5 + (index * 0.1), ease: "easeOut" }}
                        className={`h-full rounded-full ${index === 0 ? 'bg-[#6366F1]' : 'bg-gray-600'}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row w-full max-w-md gap-4"
        >
          {!isUnrelated && (
            <button 
              onClick={() => navigate('/explain', { state: { result, originalFile: location.state?.originalFile } })}
              className="flex-1 bg-[#6366F1] hover:bg-indigo-500 text-white font-medium py-3.5 px-6 rounded-2xl transition duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Explanation
            </button>
          )}
          <button 
            onClick={() => navigate(isUnrelated ? '/scan' : '/dashboard')}
            className={`flex-1 ${isUnrelated ? 'bg-[#6366F1] hover:bg-indigo-500' : 'bg-gray-800 hover:bg-gray-700'} text-white font-medium py-3.5 px-6 rounded-2xl transition duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2`}
          >
            {isUnrelated ? 'Try Again' : 'Back to Dashboard'}
          </button>
        </motion.div>
    </AppShell>
  )
}
