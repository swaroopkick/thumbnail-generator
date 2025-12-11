import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ThumbnailGallery from '../components/ThumbnailGallery'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

const mockThumbnails = [
  {
    id: 'thumb_1',
    url: 'http://localhost:8000/exports/thumb_1.png',
    title: 'Generated Thumbnail 1',
    prompt: 'Test prompt for thumbnail 1',
    exports: {
      PNG: {
        format: 'PNG',
        url: 'http://localhost:8000/exports/thumb_1.png',
        file_path: '/exports/thumb_1.png',
        size: 102400,
        exported_at: '2024-01-01T00:00:00Z'
      },
      JPEG: {
        format: 'JPEG',
        url: 'http://localhost:8000/exports/thumb_1.jpeg',
        file_path: '/exports/thumb_1.jpeg',
        size: 85000,
        exported_at: '2024-01-01T00:00:00Z'
      }
    }
  },
  {
    id: 'thumb_2',
    url: 'http://localhost:8000/exports/thumb_2.webp',
    title: 'Generated Thumbnail 2',
    prompt: 'Test prompt for thumbnail 2',
    exports: {
      WEBP: {
        format: 'WEBP',
        url: 'http://localhost:8000/exports/thumb_2.webp',
        file_path: '/exports/thumb_2.webp',
        size: 65000,
        exported_at: '2024-01-01T00:00:01Z'
      }
    }
  }
]

// Mock URL.createObjectURL and document operations
global.URL.createObjectURL = vi.fn(() => 'mocked-url')
global.document = {
  createElement: vi.fn(() => ({
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    click: vi.fn(),
    setAttribute: vi.fn(),
    style: {}
  })),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
}

describe('ThumbnailGallery Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render thumbnails in a grid layout', () => {
    useStore.mockReturnValue({
      thumbnails: mockThumbnails,
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    expect(screen.getByText('Generated Thumbnails')).toBeInTheDocument()
    expect(screen.getByText('2 thumbnails')).toBeInTheDocument()
    
    // Check that thumbnails are rendered
    expect(screen.getByAltText('Generated Thumbnail 1')).toBeInTheDocument()
    expect(screen.getByAltText('Generated Thumbnail 2')).toBeInTheDocument()
  })

  it('should show bulk download button when thumbnails exist', () => {
    useStore.mockReturnValue({
      thumbnails: mockThumbnails,
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    expect(screen.getByText('Download All')).toBeInTheDocument()
  })

  it('should handle download for PNG format', async () => {
    const user = userEvent.setup()
    
    useStore.mockReturnValue({
      thumbnails: [mockThumbnails[0]],
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    // Find and click the PNG download button
    const pngButton = screen.getByText('PNG')
    await user.click(pngButton)

    // Verify download was triggered
    expect(global.document.createElement).toHaveBeenCalledWith('a')
    expect(global.document.body.appendChild).toHaveBeenCalled()
    expect(global.document.body.removeChild).toHaveBeenCalled()
  })

  it('should handle download for JPEG format', async () => {
    const user = userEvent.setup()
    
    useStore.mockReturnValue({
      thumbnails: [mockThumbnails[0]],
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    const jpegButton = screen.getByText('JPG')
    await user.click(jpegButton)

    expect(global.document.createElement).toHaveBeenCalledWith('a')
    expect(global.document.body.appendChild).toHaveBeenCalled()
  })

  it('should handle download for WEBP format', async () => {
    const user = userEvent.setup()
    
    useStore.mockReturnValue({
      thumbnails: [mockThumbnails[1]],
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    const webpButton = screen.getByText('WEBP')
    await user.click(webpButton)

    expect(global.document.createElement).toHaveBeenCalledWith('a')
  })

  it('should handle bulk download', async () => {
    const user = userEvent.setup()
    
    useStore.mockReturnValue({
      thumbnails: mockThumbnails,
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    const bulkDownloadButton = screen.getByText('Download All')
    await user.click(bulkDownloadButton)

    // Should trigger multiple downloads (one for each thumbnail)
    expect(global.document.body.appendChild).toHaveBeenCalledTimes(2)
  })

  it('should show loading state when generating thumbnails', () => {
    useStore.mockReturnValue({
      thumbnails: [],
      loading: true,
      error: null
    })

    render(<ThumbnailGallery />)

    expect(screen.getByText('Generated Thumbnails')).toBeInTheDocument()
    // Check for skeleton loading elements
    expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument()
  })

  it('should show error state with retry button', () => {
    const mockRetry = vi.fn()
    
    useStore.mockReturnValue({
      thumbnails: [],
      loading: false,
      error: 'Failed to generate thumbnails',
      generateThumbnails: mockRetry
    })

    render(<ThumbnailGallery />)

    expect(screen.getByText('Error Generating Thumbnails')).toBeInTheDocument()
    expect(screen.getByText('Failed to generate thumbnails')).toBeInTheDocument()
    
    const retryButton = screen.getByText('Try Again')
    expect(retryButton).toBeInTheDocument()
  })

  it('should show empty state when no thumbnails', () => {
    useStore.mockReturnValue({
      thumbnails: [],
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    expect(screen.getByText('No thumbnails yet')).toBeInTheDocument()
    expect(screen.getByText('Fill out the form above to generate your first set of thumbnails')).toBeInTheDocument()
  })

  it('should disable download buttons during download', async () => {
    const user = userEvent.setup()
    
    useStore.mockReturnValue({
      thumbnails: [mockThumbnails[0]],
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    // Start a download
    const pngButton = screen.getByText('PNG')
    fireEvent.click(pngButton)

    // Button should show loading state
    await waitFor(() => {
      expect(screen.getByText('PNG')).toBeInTheDocument()
      // Should show spinner during download
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument()
    })
  })

  it('should render thumbnail metadata correctly', () => {
    useStore.mockReturnValue({
      thumbnails: mockThumbnails,
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    // Check thumbnail titles
    expect(screen.getByText('Generated Thumbnail 1')).toBeInTheDocument()
    expect(screen.getByText('Generated Thumbnail 2')).toBeInTheDocument()

    // Check prompts
    expect(screen.getByText('Test prompt for thumbnail 1')).toBeInTheDocument()
    expect(screen.getByText('Test prompt for thumbnail 2')).toBeInTheDocument()
  })

  it('should handle missing export formats gracefully', () => {
    const thumbnailWithoutExports = {
      id: 'thumb_no_exports',
      url: 'http://localhost:8000/exports/thumb_no_exports.png',
      title: 'Thumbnail without exports',
      prompt: 'Test prompt',
      exports: null
    }

    useStore.mockReturnValue({
      thumbnails: [thumbnailWithoutExports],
      loading: false,
      error: null
    })

    render(<ThumbnailGallery />)

    // Should still render the thumbnail
    expect(screen.getByAltText('Thumbnail without exports')).toBeInTheDocument()
    expect(screen.getByText('Thumbnail without exports')).toBeInTheDocument()
  })
})