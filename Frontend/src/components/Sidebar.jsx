import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../store/useStore'

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/scan', label: 'New Scan' },
  { to: '/processing', label: 'Processing' },
  { to: '/result', label: 'Result' },
  { to: '/explain', label: 'Explainability' },
  { to: '/history', label: 'History' },
]

function navClass({ isActive }) {
  return [
    'rounded-2xl px-4 py-3 text-sm font-medium transition',
    isActive
      ? 'bg-cyan-300/12 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.26)]'
      : 'text-slate-400 hover:bg-white/5 hover:text-white',
  ].join(' ')
}

export default function Sidebar() {
  const navigate = useNavigate()
  const user = useStore((state) => state.user)
  const logout = useStore((state) => state.logout)

  return (
    <aside className="border-r border-white/5 bg-slate-950/35 px-4 py-4 backdrop-blur-xl lg:min-h-screen">
      <div className="sticky top-4 space-y-6">
        <motion.button
          whileHover={{ y: -1 }}
          onClick={() => navigate('/')}
          className="flex w-full items-start justify-between rounded-3xl border border-white/10 bg-white/5 p-4 text-left"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Derm AI</p>
            <h2 className="mt-2 text-lg font-semibold text-white">Skin diagnosis workspace</h2>
          </div>
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-300 to-sky-400" />
        </motion.button>

        <nav className="panel-soft flex flex-col gap-2 p-3">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="panel-soft p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Mode</p>
          <p className="mt-3 text-sm text-slate-200">{user ? `Signed in as ${user.username}` : 'Guest mode with local history'}</p>
          <p className="mt-2 text-xs leading-6 text-slate-400">
            Authentication is optional. Sign in only if you want scans saved in SQLite.
          </p>
          <div className="mt-4 flex gap-3">
            {user ? (
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="button-secondary flex-1"
              >
                Log out
              </button>
            ) : (
              <button onClick={() => navigate('/login')} className="button-primary flex-1">
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
