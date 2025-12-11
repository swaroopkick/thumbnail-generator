import { create } from 'zustand'

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
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock generated thumbnails for now
      const mockThumbnails = [
        {
          id: Date.now() + 1,
          url: '/api/placeholder/400/225',
          title: 'Generated Thumbnail 1',
          prompt: 'Professional gaming setup with RGB lighting'
        },
        {
          id: Date.now() + 2,
          url: '/api/placeholder/400/225',
          title: 'Generated Thumbnail 2',
          prompt: 'Person reacting to game content'
        },
        {
          id: Date.now() + 3,
          url: '/api/placeholder/400/225',
          title: 'Generated Thumbnail 3',
          prompt: 'Minimalist tech thumbnail design'
        }
      ]
      
      set((state) => ({
        thumbnails: [...state.thumbnails, ...mockThumbnails],
        loading: false
      }))
      
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
}))
