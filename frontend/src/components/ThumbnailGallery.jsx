import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useState } from 'react'

export default function ThumbnailGallery() {
  const { thumbnails, loading, error } = useStore()
  const [downloading, setDownloading] = useState({})
  const [bulkDownloading, setBulkDownloading] = useState(false)
  const { generateThumbnails } = useStore()

  // Retry function for failed generations
  const handleRetry = () => {
    generateThumbnails()
  }

  // Helper function to download a single file
  const downloadFile = async (thumbnail, format = 'png') => {
    const thumbnailId = thumbnail.id
    setDownloading(prev => ({ ...prev, [thumbnailId]: format }))
    
    try {
      // Get the appropriate export URL for the requested format
      const exportData = thumbnail.exports?.[format.toUpperCase()]
      const downloadUrl = exportData?.url || thumbnail.url
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `thumbnail_${thumbnailId}_${format}.${format}`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      console.error('Download failed:', error)
      alert(`Failed to download ${format.toUpperCase()} file. Please try again.`)
    } finally {
      setDownloading(prev => {
        const newState = { ...prev }
        delete newState[thumbnailId]
        return newState
      })
    }
  }

  // Helper function for bulk download (zip or sequential)
  const bulkDownload = async () => {
    if (thumbnails.length === 0) return
    
    setBulkDownloading(true)
    
    try {
      // For now, implement sequential download (can be enhanced to create ZIP)
      for (let i = 0; i < thumbnails.length; i++) {
        const thumbnail = thumbnails[i]
        // Download PNG by default for bulk download
        await downloadFile(thumbnail, 'png')
        // Small delay between downloads to avoid overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    } catch (error) {
      console.error('Bulk download failed:', error)
      alert('Bulk download failed. Please try again.')
    } finally {
      setBulkDownloading(false)
    }
  }

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
        <motion.button
          onClick={handleRetry}
          className="btn-primary mt-4"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </motion.button>
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
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {thumbnails.length} thumbnail{thumbnails.length !== 1 ? 's' : ''}
          </span>
          {thumbnails.length > 0 && (
            <motion.button
              onClick={bulkDownload}
              disabled={bulkDownloading}
              className="btn-secondary text-sm"
              whileHover={{ scale: bulkDownloading ? 1 : 1.02 }}
              whileTap={{ scale: bulkDownloading ? 1 : 0.98 }}
            >
              {bulkDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Downloading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All
                </>
              )}
            </motion.button>
          )}
        </div>
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
              <motion.img
                src={thumbnail.url}
                alt={thumbnail.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
                transition={{ duration: 0.3 }}
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
              
              {/* 3D Overlay Actions */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4"
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                {/* Format Selection */}
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => downloadFile(thumbnail, 'png')}
                      disabled={downloading[thumbnail.id] === 'png'}
                      className="flex-1 bg-blue-600/90 hover:bg-blue-700 text-white text-xs py-2 px-3 rounded-lg backdrop-blur-sm transition-colors"
                      whileHover={{ scale: 1.02, z: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {downloading[thumbnail.id] === 'png' ? (
                        <>
                          <svg className="animate-spin w-3 h-3 mr-1 inline" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          PNG
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          PNG
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => downloadFile(thumbnail, 'jpeg')}
                      disabled={downloading[thumbnail.id] === 'jpeg'}
                      className="flex-1 bg-green-600/90 hover:bg-green-700 text-white text-xs py-2 px-3 rounded-lg backdrop-blur-sm transition-colors"
                      whileHover={{ scale: 1.02, z: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {downloading[thumbnail.id] === 'jpeg' ? (
                        <>
                          <svg className="animate-spin w-3 h-3 mr-1 inline" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          JPG
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          JPG
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => downloadFile(thumbnail, 'webp')}
                      disabled={downloading[thumbnail.id] === 'webp'}
                      className="flex-1 bg-purple-600/90 hover:bg-purple-700 text-white text-xs py-2 px-3 rounded-lg backdrop-blur-sm transition-colors"
                      whileHover={{ scale: 1.02, z: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {downloading[thumbnail.id] === 'webp' ? (
                        <>
                          <svg className="animate-spin w-3 h-3 mr-1 inline" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          WEBP
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 mr-1 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                          </svg>
                          WEBP
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
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
