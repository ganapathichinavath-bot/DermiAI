import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import AppShell from '../components/AppShell'
import { assetUrl } from '../api'

// ── Per-class written explanations ──────────────────────────────────────────
const CONDITION_INFO = {
  akiec: {
    what: 'Actinic Keratosis (AK) is a rough, scaly patch of skin that develops from years of sun exposure. It is considered precancerous — meaning it can evolve into squamous cell carcinoma if untreated.',
    causes: 'Prolonged UV radiation, fair skin, outdoor lifestyle, or immunosuppression are common contributing factors.',
    symptoms: 'Rough or scaly patch (often red, pink, or brown), flat-to-slightly-raised lesion, itching or burning sensation in the area.',
    nextSteps: [
      'See a dermatologist promptly for a proper clinical evaluation.',
      'Treatment options include cryotherapy, topical creams (5-FU, imiquimod), or photodynamic therapy.',
      'Use broad-spectrum SPF 30+ sunscreen daily and avoid peak UV hours.',
      'Self-monitor and report any rapid changes in size, colour, or texture.',
    ],
    riskNote: 'Left untreated, approximately 5–10% of actinic keratoses progress to squamous cell carcinoma.',
  },
  bcc: {
    what: 'Basal Cell Carcinoma (BCC) is the most common type of skin cancer. It originates in the basal cells — the bottom layer of the epidermis. BCC rarely metastasises but can grow and become disfiguring if ignored.',
    causes: 'Cumulative UV exposure, history of sunburns, light skin and eyes, radiation therapy, and certain genetic syndromes.',
    symptoms: 'Pearly or waxy bump, flat flesh-coloured or brown scar-like lesion, bleeding or oozing sore that heals and returns.',
    nextSteps: [
      'Seek urgent evaluation by a board-certified dermatologist or oncologist.',
      'Common treatments include Mohs surgery, excision, curettage, or radiation therapy.',
      'Avoid further UV exposure and wear protective clothing.',
      'Regular full-body skin checks every 6–12 months are strongly recommended.',
    ],
    riskNote: 'BCC is highly treatable when caught early. Early surgical removal typically results in a cure rate of >95%.',
  },
  bkl: {
    what: 'Benign Keratosis (seborrhoeic keratosis) is a non-cancerous skin growth that commonly appears with age. Despite their sometimes alarming appearance, they are completely harmless.',
    causes: 'Age-related skin changes and genetics are the primary drivers. They are not caused by sun exposure or infections.',
    symptoms: 'Waxy, "stuck-on" appearance, brown to black colour, rough or warty surface, variable size from a few mm to several cm.',
    nextSteps: [
      'No medical treatment is required for purely cosmetic cases.',
      'Consult a dermatologist if the lesion bleeds, itches excessively, or changes rapidly.',
      'Removal options (for comfort or cosmesis) include cryotherapy or curettage.',
      'Continue routine skin self-exams to detect any new or changing lesions.',
    ],
    riskNote: 'Benign keratoses pose no cancer risk. However, melanoma can occasionally mimic their appearance — professional confirmation is wise.',
  },
  df: {
    what: 'Dermatofibroma is a common, benign fibrous nodule that typically appears on the legs or arms. It is composed of fibroblasts and inflammatory cells and is generally harmless.',
    causes: 'Often triggered by minor skin injuries such as insect bites, ingrown hairs, or small puncture wounds.',
    symptoms: 'Small, firm, dome-shaped bump (usually 5–10 mm), brownish or reddish colour, "dimple sign" when pinched, mildly itchy or tender.',
    nextSteps: [
      'No treatment is necessary unless the lesion is bothersome or cosmetically concerning.',
      'A dermatologist can confirm the diagnosis clinically or with a simple biopsy.',
      'Surgical excision is an option but may leave a scar; laser therapy is another choice.',
      'Monitor for any rapid growth, ulceration, or colour change.',
    ],
    riskNote: 'Dermatofibromas are benign and do not become cancerous. Excision is curative.',
  },
  mel: {
    what: 'Melanoma is the most dangerous form of skin cancer, arising from the pigment-producing cells (melanocytes). It can spread rapidly to lymph nodes and other organs if not detected and treated early.',
    causes: 'UV radiation (sun and tanning beds), fair skin, family history, large number of moles, or a history of previous melanomas.',
    symptoms: 'Asymmetric mole, irregular borders, multiple colours (brown, black, red, white, blue), diameter >6 mm, evolving in shape, size, or colour.',
    nextSteps: [
      '⚠️ Seek immediate evaluation by a dermatologist or melanoma specialist.',
      'A skin biopsy is the definitive way to confirm or rule out melanoma.',
      'If confirmed, staging scans (CT, PET) may be needed to assess spread.',
      'Treatment may include surgical excision, immunotherapy, targeted therapy, or radiation.',
      'Practice the ABCDE rule (Asymmetry, Border, Colour, Diameter, Evolution) for self-monitoring.',
    ],
    riskNote: 'Early-stage melanoma (Stage I) has a 5-year survival rate of ~98%. Delayed treatment dramatically worsens outcomes.',
  },
  nv: {
    what: 'Melanocytic Nevus (common mole) is a benign skin lesion formed by clusters of melanocytes. Most adults have 10–40 moles. The vast majority are completely harmless.',
    causes: 'Genetics, sun exposure during childhood, and hormonal changes (puberty, pregnancy) influence mole development.',
    symptoms: 'Symmetrical, well-defined round or oval shape, uniform colour (tan, brown, or skin-coloured), flat or slightly raised, usually <6 mm.',
    nextSteps: [
      'No immediate action is required for stable, ordinary moles.',
      'Practise monthly self-skin exams using the ABCDE checklist.',
      'Schedule an annual skin check with a dermatologist, especially if you have many moles.',
      'Seek prompt review for any mole that grows rapidly, bleeds, or changes appearance.',
    ],
    riskNote: 'Common moles carry a very low risk of turning into melanoma. Atypical (dysplastic) moles carry slightly higher risk and should be monitored closely.',
  },
  vasc: {
    what: 'Vascular Lesion refers to abnormalities involving blood or lymphatic vessels near the skin surface, including haemangiomas, pyogenic granulomas, and angiokeratomas.',
    causes: 'Congenital factors, trauma, hormonal influences, or ageing. Pyogenic granulomas can arise after skin injury.',
    symptoms: 'Bright-red, purple, or blue colour; may bleed easily if traumatised; can be flat or raised; variable size.',
    nextSteps: [
      'Consult a dermatologist for proper characterisation — some vascular lesions require biopsy.',
      'Pyogenic granulomas often need removal (shave excision, laser, or cauterisation) due to bleeding risk.',
      'Most congenital haemangiomas resolve spontaneously in children; adults should still seek assessment.',
      'Protect the area from trauma to minimise bleeding risk.',
    ],
    riskNote: 'Most vascular lesions are benign. Rare cases of angiosarcoma can mimic benign lesions — professional evaluation is important.',
  },
  normal: {
    what: 'The AI model did not detect a clearly identifiable skin lesion in this image. The skin appears to be within the expected range for healthy tissue based on our training data.',
    causes: 'N/A — no lesion was confidently detected.',
    symptoms: 'N/A',
    nextSteps: [
      'Continue routine annual skin checks with a dermatologist.',
      'Practise sun protection: SPF 30+, UV-protective clothing, and avoid tanning beds.',
      'Perform monthly self-skin exams and note any changes over time.',
      'If you have a specific concern not captured here, consult a dermatologist in person.',
    ],
    riskNote: 'Even with a low-risk result, regular professional skin checks remain important, especially for individuals with a family history of skin cancer.',
  },
}

// Risk colour palettes
const RISK_PALETTE = {
  Malignant:      { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    text: 'text-rose-400',    icon: '⚠️', dot: 'bg-rose-400' },
  Precancerous:   { bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  text: 'text-orange-400',  icon: '🔶', dot: 'bg-orange-400' },
  'Usually benign': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400',  icon: '🟡', dot: 'bg-yellow-400' },
  Benign:         { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', icon: '✅', dot: 'bg-emerald-400' },
  Healthy:        { bg: 'bg-teal-500/10',    border: 'border-teal-500/20',    text: 'text-teal-400',    icon: '✅', dot: 'bg-teal-400' },
  Unknown:        { bg: 'bg-gray-500/10',    border: 'border-gray-500/20',    text: 'text-gray-400',    icon: 'ℹ️', dot: 'bg-gray-400' },
}

function getRiskPalette(riskLabel) {
  return RISK_PALETTE[riskLabel] || RISK_PALETTE['Unknown']
}

export default function Explain() {
  const navigate   = useNavigate()
  const location   = useLocation()
  const result     = location.state?.result
  const originalFile = location.state?.originalFile

  const [activeTab, setActiveTab] = useState('gradcam')
  const [sliderPos, setSliderPos] = useState(50)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!result) navigate('/scan')
  }, [result, navigate])

  if (!result) return null

  const heatmapUrl  = assetUrl(result.heatmap_url)
  const saliencyUrl = result.saliency_url ? assetUrl(result.saliency_url) : heatmapUrl
  const originalUrl = originalFile
    ? URL.createObjectURL(originalFile)
    : (result.original_url ? assetUrl(result.original_url) : heatmapUrl)

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
    { id: 'gradcam',  label: 'Grad-CAM',    desc: 'Shows where the model looked to make its prediction.' },
    { id: 'saliency', label: 'Saliency Map', desc: 'Highlights pixel-level sensitivity to the diagnosis.' },
    { id: 'compare',  label: 'Compare',      desc: 'Drag the slider to compare original with AI attention.' },
  ]

  // Written explanation data
  const predCode = (result.prediction_code || 'normal').toLowerCase()
  const info = CONDITION_INFO[predCode] || CONDITION_INFO['normal']
  const riskLabel = result.risk_level || 'Unknown'
  const palette = getRiskPalette(riskLabel)

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.4 } }),
  }

  return (
    <AppShell
      eyebrow="Explainable AI"
      title="Explanation"
      description={`Understand the ${result.prediction} prediction — visual AI attention maps and a plain-language clinical summary.`}
      actions={
        <button onClick={() => navigate(-1)} className="button-secondary">
          Back
        </button>
      }
    >
      {/* ── Visual AI Section ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 rounded-full bg-indigo-400"></span>
          AI Visual Attention
        </h2>

        {/* Tab Bar */}
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
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Image Display Area */}
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-4 sm:p-8 flex flex-col relative overflow-hidden min-h-[400px]">
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
                className="relative w-full h-full max-h-[60vh] select-none cursor-ew-resize group flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
              >
                <img
                  src={heatmapUrl}
                  alt="Grad-CAM"
                  className="w-full h-full object-contain max-h-[60vh] pointer-events-none"
                />
                <img
                  src={originalUrl}
                  alt="Original"
                  className="absolute inset-0 w-full h-full object-contain max-h-[60vh] pointer-events-none"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize flex items-center justify-center pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center transform -translate-x-1/2 group-hover:scale-110 transition-transform border border-[#6366F1]/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6366F1]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Written Explanation Section ──────────────────────────────────── */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <span className="inline-block w-1.5 h-5 rounded-full bg-cyan-400"></span>
          Clinical Summary
        </h2>

        {/* Risk badge + headline */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-[#111827] border border-white/5 rounded-3xl p-6 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center gap-5"
        >
          <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border self-start sm:self-auto shrink-0 ${palette.bg} ${palette.border}`}>
            <span className={`w-2.5 h-2.5 rounded-full ${palette.dot}`}></span>
            <span className={`text-sm font-bold uppercase tracking-wider ${palette.text}`}>{riskLabel}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{result.prediction}</h3>
            <p className="text-gray-400 text-sm mt-1">
              Confidence: <span className="text-indigo-400 font-semibold">{Math.round(result.confidence)}%</span>
              &nbsp;·&nbsp; Based on deep-learning analysis of the uploaded image
            </p>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* What is it */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="bg-[#111827] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔬</span>
              <h4 className="text-white font-bold text-base">What is this condition?</h4>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{info.what}</p>
            {info.causes && info.causes !== 'N/A — no lesion was confidently detected.' && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Common causes</p>
                <p className="text-gray-400 text-sm leading-relaxed">{info.causes}</p>
              </div>
            )}
          </motion.div>

          {/* Symptoms */}
          {info.symptoms && info.symptoms !== 'N/A' && (
            <motion.div
              custom={2}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-[#111827] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <h4 className="text-white font-bold text-base">Typical Signs & Symptoms</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{info.symptoms}</p>

              {/* Risk note */}
              <div className={`rounded-2xl border p-4 mt-auto ${palette.bg} ${palette.border}`}>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${palette.text}`}>Risk Note</p>
                <p className="text-gray-300 text-sm leading-relaxed">{info.riskNote}</p>
              </div>
            </motion.div>
          )}

          {/* Next Steps — full width */}
          <motion.div
            custom={3}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="md:col-span-2 bg-[#111827] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <h4 className="text-white font-bold text-base">Recommended Next Steps</h4>
            </div>
            <ul className="space-y-3">
              {info.nextSteps.map((step, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.08 }}
                  className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed"
                >
                  <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${palette.bg} ${palette.text} border ${palette.border}`}>
                    {i + 1}
                  </span>
                  {step}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* How the AI works */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-slate-900/20 border border-indigo-500/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6"
          >
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl shrink-0">🤖</span>
              <div>
                <h4 className="text-white font-bold text-base mb-2">How did the AI reach this conclusion?</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  The model is an <span className="text-indigo-300 font-medium">EfficientNetV2</span> deep convolutional network trained on the{' '}
                  <span className="text-indigo-300 font-medium">HAM10000</span> dataset (10,015 dermoscopic images across 7 skin lesion classes). 
                  It uses <span className="text-indigo-300 font-medium">Test-Time Augmentation (TTA)</span> — running the image through 5 different orientations and averaging predictions — 
                  to improve robustness. The coloured heat-maps above are generated by{' '}
                  <span className="text-indigo-300 font-medium">Grad-CAM</span> (Gradient-weighted Class Activation Mapping), 
                  which visualises which pixels most influenced the classification decision.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl shrink-0">⚕️</span>
              <div>
                <h4 className="text-white font-bold text-base mb-2">Medical Disclaimer</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This tool is for <span className="text-amber-400 font-semibold">educational and research purposes only</span>. 
                  It is not a licensed medical device and should never replace a consultation with a qualified dermatologist or physician. 
                  Always seek professional medical advice for diagnosis and treatment decisions.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </AppShell>
  )
}
