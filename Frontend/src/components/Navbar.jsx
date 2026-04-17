import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'

export default function Navbar() {
  const { user, token, logout } = useStore()
  const navigate = useNavigate()

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <Link to="/"><span className="text-xl font-bold gradient-text">DermAI</span></Link>
      <div className="flex items-center gap-6">
        <Link to="/scan"    className="text-slate-300 hover:text-white text-sm transition">Scan</Link>
        <Link to="/history" className="text-slate-300 hover:text-white text-sm transition">History</Link>
        {token ? (
          <>
            <span className="text-slate-400 text-sm hidden md:block">{user?.username}</span>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => { logout(); navigate('/') }}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1.5 rounded-lg">
              Logout
            </motion.button>
          </>
        ) : (
          <Link to="/login">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-1.5 rounded-lg">
              Login
            </motion.button>
          </Link>
        )}
      </div>
    </nav>
  )
}