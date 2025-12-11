import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'

const ASPECT_RATIOS = [
  { value: '16:9', label: '16:9 (YouTube)', dimensions: '1280x720' },
  { value: '1:1', label: '1:1 (Square)', dimensions: '1080x1080' },
  { value: '9:16', label: '9:16 (Vertical)', dimensions: '720x1280' },
  { value: '4:3', label: '4:3 (Classic)', dimensions: '1024x768' }
]

export default function InputForm() {
  const {
    formData,
    updateScript,
    updateAspectRatio,
    setUploadedImage,
    generateThumbnails,
    loading
  } = useStore()
  
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }))
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(file, e.target.result)
      setErrors(prev => ({ ...prev, image: null }))
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.script.trim()) {
      newErrors.script = 'Please enter a video script or description'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    await generateThumbnails()
  }

  const removeImage = () => {
    setUploadedImage(null, null)
    setErrors(prev => ({ ...prev, image: null }))
  }

  return (
    <motion.div
      className="glass-card p-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-2xl font-bold text-white mb-6">
        Create Your Thumbnail
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Script Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Video Script or Description
          </label>
          <textarea
            value={formData.script}
            onChange={(e) => updateScript(e.target.value)}
            placeholder="Enter your video script, key points, or describe what your video is about..."
            rows={4}
            className={`form-input w-full resize-none ${errors.script ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.script && (
            <motion.p
              className="text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.script}
            </motion.p>
          )}
        </div>

        {/* Aspect Ratio Selector */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Aspect Ratio
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {ASPECT_RATIOS.map((ratio) => (
              <motion.button
                key={ratio.value}
                type="button"
                onClick={() => updateAspectRatio(ratio.value)}
                className={`p-3 rounded-lg border transition-all ${
                  formData.aspectRatio === ratio.value
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
              >
                <div className="text-sm font-medium">{ratio.label}</div>
                <div className="text-xs opacity-75">{ratio.dimensions}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Upload Image (Optional)
          </label>
          
          {!formData.uploadedImagePreview ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-purple-500 bg-purple-500/10'
                  : errors.image
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-white/20 hover:border-white/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-gray-300">
                  <label className="cursor-pointer">
                    <span className="text-purple-400 hover:text-purple-300">Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileInput}
                      disabled={loading}
                    />
                  </label>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative">
              <img
                src={formData.uploadedImagePreview}
                alt="Upload preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                disabled={loading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {errors.image && (
            <motion.p
              className="text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {errors.image}
            </motion.p>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="btn-primary w-full"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Thumbnails...
            </div>
          ) : (
            'Generate Thumbnails'
          )}
        </motion.button>
      </form>
    </motion.div>
  )
}
