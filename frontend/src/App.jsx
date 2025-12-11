import { motion } from 'framer-motion'
import Hero3D from './components/Hero3D'
import Header from './components/Header'
import InputForm from './components/InputForm'
import ThumbnailGallery from './components/ThumbnailGallery'
import { useStore } from './store/useStore'

function App() {
  const { thumbnails } = useStore()

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Hero Background */}
      <Hero3D />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="container mx-auto px-6 pb-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                Create Stunning
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {' '}Thumbnails
                </span>
                <br />
                with AI
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Transform your video content into eye-catching thumbnails using AI-powered design. 
                Upload your script, add optional images, and watch AI create professional thumbnails instantly.
              </p>
            </motion.div>

            {/* Input Form */}
            <InputForm />
            
            {/* Thumbnail Gallery */}
            <div className="mt-12">
              <ThumbnailGallery />
            </div>
            
            {/* Features Section */}
            {thumbnails.length === 0 && (
              <motion.div
                className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <div className="text-center p-6 glass-card">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                  <p className="text-gray-400 text-sm">
                    Generate multiple thumbnail variations in seconds using our advanced AI models
                  </p>
                </div>
                
                <div className="text-center p-6 glass-card">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Multiple Formats</h3>
                  <p className="text-gray-400 text-sm">
                    Support for all popular aspect ratios including YouTube, Instagram, and TikTok
                  </p>
                </div>
                
                <div className="text-center p-6 glass-card">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Professional Quality</h3>
                  <p className="text-gray-400 text-sm">
                    High-resolution thumbnails with professional design elements and typography
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <motion.footer
          className="relative z-10 border-t border-white/10 mt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="container mx-auto px-6 py-8">
            <div className="text-center text-gray-400">
              <p className="text-sm">
                © 2024 Thumbnail Generator. Built with AI, React, and Framer Motion.
              </p>
              <div className="flex items-center justify-center space-x-6 mt-4 text-xs">
                <span className="hover:text-purple-400 cursor-pointer transition-colors">Privacy</span>
                <span className="hover:text-purple-400 cursor-pointer transition-colors">Terms</span>
                <span className="hover:text-purple-400 cursor-pointer transition-colors">Support</span>
                <span className="hover:text-purple-400 cursor-pointer transition-colors">API</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}

export default App
