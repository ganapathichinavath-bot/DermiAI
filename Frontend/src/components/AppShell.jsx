import { motion } from 'framer-motion'
import Sidebar from './Sidebar'

export default function AppShell({ title, eyebrow, description, actions, children }) {
  return (
    <div className="page-grid">
      <Sidebar />
      <main className="px-4 py-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto flex max-w-7xl flex-col gap-6"
        >
          <header className="panel overflow-hidden p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-200/70">
                  {eyebrow}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </header>
          {children}
        </motion.div>
      </main>
    </div>
  )
}
