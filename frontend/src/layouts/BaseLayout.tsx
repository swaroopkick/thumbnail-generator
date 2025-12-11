import React from 'react'
import { motion } from 'framer-motion'

interface BaseLayoutProps {
  children: React.ReactNode
  title?: string
}

export const BaseLayout: React.FC<BaseLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800 bg-opacity-50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-white">
            {title || 'Thumbnail Generator'}
          </h1>
        </div>
      </motion.header>

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </motion.main>

      <footer className="bg-slate-900 bg-opacity-50 backdrop-blur-md border-t border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Thumbnail Generator. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default BaseLayout
