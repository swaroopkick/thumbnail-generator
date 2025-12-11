import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export default function ThumbnailGallery() {
  const { thumbnails, loading, error } = useStore()

  if (loading && thumbnails.length === 0) {
    return (
      <motion.div
        className="glass-card p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          Generated Thumbnails
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <div className="bg-white/5 rounded-lg aspect-video animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse" />
                <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="glass-card p-8 border-red-500/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex items-center space-x-3 text-red-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold">Error Generating Thumbnails</h2>
        </div>
        <p className="text-red-300 mt-2">{error}</p>
      </motion.div>
    )
  }

  if (thumbnails.length === 0) {
    return (
      <motion.div
        className="glass-card p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-gray-400">
          <svg className="mx-auto h-12 w-12 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3 className="text-lg font-medium">No thumbnails yet</h3>
          <p className="text-sm">Fill out the form above to generate your first set of thumbnails</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Generated Thumbnails
        </h2>
        <span className="text-sm text-gray-400">
          {thumbnails.length} thumbnail{thumbnails.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {thumbnails.map((thumbnail, index) => (
          <motion.div
            key={thumbnail.id}
            className="group relative bg-white/5 rounded-lg overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            {/* Thumbnail Image */}
            <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 relative overflow-hidden">
              <img
                src={thumbnail.url}
                alt={thumbnail.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'flex'
                }}
              />
              {/* Fallback for broken images */}
              <div className="hidden absolute inset-0 items-center justify-center bg-gradient-to-br from-purple-900/50 to-pink-900/50">
                <div className="text-center text-white">
                  <svg className="mx-auto h-8 w-8 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm">Image Preview</p>
                </div>
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                <motion.button
                  className="btn-secondary px-4 py-2 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </motion.button>
                <motion.button
                  className="btn-primary px-4 py-2 text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download
                </motion.button>
              </div>
            </div>
            
            {/* Thumbnail Info */}
            <div className="p-4 space-y-3">
              <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">
                {thumbnail.title}
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {thumbnail.prompt}
              </p>
              
              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="bg-white/10 px-2 py-1 rounded">
                  High Quality
                </span>
                <span>
                  Click to view full size
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Load More Button (for future pagination) */}
      {thumbnails.length > 0 && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button className="btn-secondary">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Generate More
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
