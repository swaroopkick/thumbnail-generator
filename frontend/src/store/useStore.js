import { create } from 'zustand'

// Environment-based API configuration
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:8000'
}

const getApiVersion = () => {
  return import.meta.env.VITE_API_VERSION || 'v1'
}

export const useStore = create((set, get) => ({
  // Form data state
  formData: {
    script: '',
    aspectRatio: '16:9',
    uploadedImage: null,
    uploadedImagePreview: null,
  },
  
  // Generated thumbnails state
  thumbnails: [],
  loading: false,
  error: null,
  
  // Actions for form data
  updateFormData: (updates) => set((state) => ({
    formData: { ...state.formData, ...updates }
  })),
  
  updateScript: (script) => set((state) => ({
    formData: { ...state.formData, script }
  })),
  
  updateAspectRatio: (aspectRatio) => set((state) => ({
    formData: { ...state.formData, aspectRatio }
  })),
  
  setUploadedImage: (image, preview) => set((state) => ({
    formData: { ...state.formData, uploadedImage: image, uploadedImagePreview: preview }
  })),
  
  // Actions for thumbnails
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  addThumbnails: (newThumbnails) => set((state) => ({
    thumbnails: [...state.thumbnails, ...newThumbnails],
    loading: false,
    error: null
  })),
  
  clearThumbnails: () => set({ thumbnails: [] }),
  
  generateThumbnails: async () => {
    const { formData } = get()
    set({ loading: true, error: null })
    
    try {
      // Prepare form data for multipart submission
      const apiFormData = new FormData()
      apiFormData.append('script', formData.script)
      apiFormData.append('aspect_ratio', formData.aspectRatio)
      apiFormData.append('count', '3') // Generate 3 variations by default
      
      if (formData.uploadedImage) {
        apiFormData.append('image', formData.uploadedImage)
      }
      
      const apiUrl = getApiUrl()
      const apiVersion = getApiVersion()
      const fullApiUrl = `${apiUrl}/api/${apiVersion}/thumbnails`
      
      const response = await fetch(fullApiUrl, {
        method: 'POST',
        body: apiFormData,
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }
      
      const responseData = await response.json()
      
      // Transform the response data to match our frontend structure
      const newThumbnails = responseData.variations.map((variation, index) => ({
        id: variation.id || `thumb_${Date.now()}_${index}`,
        url: variation.exports?.png?.url || variation.exports?.jpeg?.url || variation.exports?.webp?.url || variation.storage_path,
        title: `Generated Thumbnail ${index + 1}`,
        prompt: formData.script.substring(0, 100) + (formData.script.length > 100 ? '...' : ''),
        exports: variation.exports || {},
        storagePath: variation.storage_path,
        metadata: variation.metadata || {}
      }))
      
      set((state) => ({
        thumbnails: [...state.thumbnails, ...newThumbnails],
        loading: false,
        error: null
      }))
      
    } catch (error) {
      console.error('Thumbnail generation error:', error)
      set({ 
        error: error.message || 'Failed to generate thumbnails. Please try again.', 
        loading: false 
      })
    }
  },
}))
