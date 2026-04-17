import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

const STATS = [
  { value: '79%',    label: 'Test Accuracy'   },
  { value: '0.92',   label: 'AUC Score'       },
  { value: '7',      label: 'Lesion Classes'  },
  { value: '10,015', label: 'Training Images' },
]

const FEATURES = [
  { icon: '🔬', title: 'EfficientNetV2L',        desc: '120M parameter model with 3-stage progressive training on HAM10000.' },
  { icon: '🧠', title: 'Grad-CAM + Saliency',    desc: 'Regional and pixel-level explainability showing AI reasoning.' },
  { icon: '📷', title: 'Camera Capture',          desc: 'Use your device camera directly or upload existing images.' },
  { icon: '⚖️', title: 'Focal Loss + Balancing', desc: 'Handles severe class imbalance with calibrated threshold scaling.' },
  { icon: '📊', title: '7-Class Diagnosis',       desc: 'Full HAM10000 spectrum: melanoma, nevi, BCC, and more.' },
  { icon: '📋', title: 'Scan History',            desc: 'Track all your past diagnoses with full result details.' },
]

const CLASSES = [
  { code: 'mel',   name: 'Melanoma',            risk: 'Malignant',      color: 'bg-red-500'    },
  { code: 'nv',    name: 'Melanocytic Nevi',    risk: 'Benign',         color: 'bg-green-500'  },
  { code: 'bcc',   name: 'Basal Cell Carcinoma',risk: 'Malignant',      color: 'bg-red-500'    },
  { code: 'akiec', name: 'Actinic Keratoses',   risk: 'Precancerous',   color: 'bg-orange-500' },
  { code: 'bkl',   name: 'Benign Keratosis',    risk: 'Benign',         color: 'bg-green-500'  },
  { code: 'df',    name: 'Dermatofibroma',       risk: 'Benign',         color: 'bg-green-500'  },
  { code: 'vasc',  name: 'Vascular Lesions',     risk: 'Usually Benign', color: 'bg-yellow-500' },
]

const RISK_STYLE = {
  Malignant:      'bg-red-950 text-red-400 border-red-800',
  Precancerous:   'bg-orange-950 text-orange-400 border-orange-800',
  Benign:         'bg-green-950 text-green-400 border-green-800',
  'Usually Benign':'bg-yellow-950 text-yellow-400 border-yellow-800',
}

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-violet-950 border border-violet-800 text-violet-300 text-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            EfficientNetV2L + Grad-CAM + Saliency Maps
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            AI Skin Lesion<br />
            <span className="gradient-text">Diagnosis</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload or capture a skin lesion image and get an instant AI-powered
            diagnosis with Grad-CAM and Saliency Map explainability.
            Trained on HAM10000 with 79% accuracy across 7 lesion classes.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/scan')}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg">
              🔬 Start Diagnosis
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/history')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg">
              📋 View History
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 border-y border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-4xl font-bold gradient-text mb-2">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for <span className="gradient-text">Clinical Trust</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Every component is designed with accuracy, explainability, and usability.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.1 }} whileHover={{ y: -6, scale: 1.02 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-violet-700 transition-all">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="py-24 px-6 bg-slate-900/40">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">7 Lesion <span className="gradient-text">Classes</span></h2>
            <p className="text-slate-400 max-w-xl mx-auto">Full HAM10000 diagnostic spectrum.</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {CLASSES.map((cls, i) => (
              <motion.div key={cls.code} initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
                transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.04, y: -4 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${cls.color}`} />
                  <span className="text-slate-400 text-xs font-mono">{cls.code}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{cls.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${RISK_STYLE[cls.risk]}`}>
                  {cls.risk}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-violet-900/50 to-purple-900/30 border border-violet-800 rounded-3xl p-12">
            <div className="text-5xl mb-6">🔬</div>
            <h2 className="text-4xl font-bold mb-4">Ready to Analyze?</h2>
            <p className="text-slate-400 mb-8">No account required. Upload or capture a skin lesion image and get AI-powered diagnosis in seconds.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/scan')}
                className="bg-violet-600 hover:bg-violet-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg">
                Start Free Diagnosis
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg">
                Create Account
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xl font-bold gradient-text">DermAI</span>
            <p className="text-slate-500 text-xs mt-1">AI-powered skin lesion classification</p>
          </div>
          <p className="text-slate-600 text-xs text-center">
            ⚠️ For educational purposes only. Not a substitute for medical advice.
          </p>
        </div>
      </footer>
    </div>
  )
}