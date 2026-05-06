import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { auth } from '../../firebase'
import { signOut } from 'firebase/auth'
import useStore from '../store/useStore'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  
  const token = useStore(s => s.token)
  const user = useStore(s => s.user)
  const logoutState = useStore(s => s.logout)

  const handleLogout = async () => {
    try {
      await signOut(auth)
      logoutState()
      navigate('/')
      setIsOpen(false)
    } catch (err) {
      console.error('Logout error', err)
    }
  }

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Scan', path: '/scan' },
    { name: 'History', path: '/history' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F19]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">DermAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-4">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-indigo-400' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center border-l border-white/10 pl-8">
              {token && user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={user.photo_url || 'https://via.placeholder.com/40'} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-indigo-500/30"
                    />
                    <span className="text-sm font-medium text-white">{user.display_name}</span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-rose-400 transition">
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/login" className="btn-primary py-2 px-4 text-sm whitespace-nowrap shadow-lg shadow-indigo-500/20">
                  Sign in with Google
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(true)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 w-64 bg-[#0B0F19] border-l border-white/10 shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <span className="text-lg font-bold text-white">Menu</span>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {token && user && (
                <div className="p-4 border-b border-white/10 bg-gray-900/30">
                  <div className="flex items-center gap-3 mb-2">
                    <img 
                      src={user.photo_url || 'https://via.placeholder.com/40'} 
                      alt="Profile" 
                      className="w-10 h-10 rounded-full object-cover border border-indigo-500/30"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">{user.display_name}</div>
                      <div className="text-xs text-gray-500 truncate w-40">{user.email}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col space-y-1 px-2">
                  {links.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-base font-medium ${
                        location.pathname === link.path 
                          ? 'bg-indigo-500/10 text-indigo-400' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-white/10">
                {token && user ? (
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-rose-400 hover:bg-rose-500/10 rounded-xl font-medium transition">
                    Logout
                  </button>
                ) : (
                  <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary w-full block text-center py-3">
                    Sign in with Google
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  )
}
