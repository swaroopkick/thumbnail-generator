import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import BaseLayout from './layouts/BaseLayout'

function App() {
  const [apiStatus, setApiStatus] = useState<string>('checking...')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkApi = async () => {
      try {
        const response = await fetch('http://localhost:8000/health')
        if (response.ok) {
          setApiStatus('connected')
        } else {
          setApiStatus('disconnected')
        }
      } catch (error) {
        setApiStatus('disconnected')
      } finally {
        setIsLoading(false)
      }
    }

    checkApi()
  }, [])

  const statusColor =
    apiStatus === 'connected'
      ? 'text-green-400'
      : apiStatus === 'checking...'
        ? 'text-yellow-400'
        : 'text-red-400'

  return (
    <BaseLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Welcome</h2>
          <p className="text-slate-300 mb-4">
            This is a thumbnail generator powered by Google Generative AI. Upload an image and
            let our AI create custom thumbnails for your content.
          </p>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span className="text-slate-300">FastAPI Backend</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="text-slate-300">React + TypeScript Frontend</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-pink-400"></div>
              <span className="text-slate-300">Google Generative AI Integration</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-800 rounded-lg p-8 border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">API Status</h2>
          <div className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm mb-2">Backend Connection</p>
              {!isLoading ? (
                <p className={`text-lg font-semibold capitalize ${statusColor}`}>
                  {apiStatus}
                </p>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-yellow-400">Checking connection...</span>
                </div>
              )}
            </div>
            <div className="pt-4">
              <p className="text-slate-400 text-sm mb-2">Backend URL</p>
              <p className="text-slate-300 font-mono text-sm">http://localhost:8000</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">API Documentation</p>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Swagger UI
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-12 bg-slate-800 rounded-lg p-8 border border-slate-700"
      >
        <h2 className="text-2xl font-semibold text-white mb-4">Architecture</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">1</span>
            </div>
            <h3 className="text-white font-semibold mb-2">Frontend</h3>
            <p className="text-slate-400 text-sm">React + TypeScript with Vite, Tailwind & Framer Motion</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">2</span>
            </div>
            <h3 className="text-white font-semibold mb-2">API Layer</h3>
            <p className="text-slate-400 text-sm">FastAPI with CORS enabled for secure communication</p>
          </div>
          <div className="text-center">
            <div className="bg-pink-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">3</span>
            </div>
            <h3 className="text-white font-semibold mb-2">AI Engine</h3>
            <p className="text-slate-400 text-sm">Google Generative AI for intelligent thumbnail generation</p>
          </div>
        </div>
      </motion.div>
    </BaseLayout>
  )
}

export default App
