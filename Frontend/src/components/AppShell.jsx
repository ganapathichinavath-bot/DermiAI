import { motion } from 'framer-motion'

export default function AppShell({ title, eyebrow, description, actions, children }) {
  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto flex max-w-7xl flex-col gap-6"
        >
          <header className="glass-panel p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-indigo-400">
                  {eyebrow}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">{description}</p>
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
