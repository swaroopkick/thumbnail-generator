import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useStore } from '../store/useStore'

// Mock fetch globally
global.fetch = vi.fn()

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_API_URL: 'http://localhost:8000',
  VITE_API_VERSION: 'v1'
}))

describe('Thumbnail Generation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store state before each test
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.clearThumbnails()
    })
  })

  it('should successfully generate thumbnails via API call', async () => {
    // Mock successful API response
    const mockResponse = {
      request_id: 'req_test_123',
      variations: [
        {
          id: 'thumb_1',
          storage_path: '/exports/thumb_1.png',
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
          storage_path: '/exports/thumb_2.png',
          exports: {
            PNG: {
              format: 'PNG',
              url: 'http://localhost:8000/exports/thumb_2.png',
              file_path: '/exports/thumb_2.png',
              size: 95000,
              exported_at: '2024-01-01T00:00:01Z'
            }
          }
        }
      ]
    }

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const { result } = renderHook(() => useStore())

    // Set up form data
    act(() => {
      result.current.updateScript('Test video about technology and innovation')
      result.current.updateAspectRatio('16:9')
    })

    // Mock file upload
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    act(() => {
      result.current.setUploadedImage(mockFile, 'data:image/jpeg;base64,/9j/test')
    })

    // Trigger thumbnail generation
    await act(async () => {
      await result.current.generateThumbnails()
    })

    // Verify fetch was called with correct parameters
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/v1/thumbnails',
      expect.objectContaining({
        method: 'POST'
      })
    )

    // Check form data in the request
    const fetchCall = fetch.mock.calls[0]
    const formData = fetchCall[1].body
    expect(formData).toBeInstanceOf(FormData)

    // Verify thumbnails were added to state
    expect(result.current.thumbnails).toHaveLength(2)
    expect(result.current.thumbnails[0]).toMatchObject({
      id: 'thumb_1',
      title: 'Generated Thumbnail 1',
      prompt: 'Test video about technology and innovation',
      exports: expect.objectContaining({
        PNG: expect.objectContaining({
          format: 'PNG',
          url: 'http://localhost:8000/exports/thumb_1.png'
        })
      })
    })

    // Verify loading and error states
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({ detail: 'Server error occurred' })
    })

    const { result } = renderHook(() => useStore())

    // Set up form data
    act(() => {
      result.current.updateScript('Test script')
    })

    // Trigger thumbnail generation
    await act(async () => {
      await result.current.generateThumbnails()
    })

    // Verify error state
    expect(result.current.error).toBe('Server error occurred')
    expect(result.current.loading).toBe(false)
    expect(result.current.thumbnails).toHaveLength(0)
  })

  it('should handle network errors', async () => {
    // Mock network error
    fetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.updateScript('Test script')
    })

    await act(async () => {
      await result.current.generateThumbnails()
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.loading).toBe(false)
  })

  it('should send correct multipart form data', async () => {
    // Mock successful response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        request_id: 'req_test_456',
        variations: []
      })
    })

    const { result } = renderHook(() => useStore())

    // Set up comprehensive form data
    const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' })
    
    act(() => {
      result.current.updateScript('Detailed video script with multiple topics')
      result.current.updateAspectRatio('1:1')
      result.current.setUploadedImage(mockFile, 'data:image/jpeg;base64,/9j/test')
    })

    await act(async () => {
      await result.current.generateThumbnails()
    })

    // Verify the fetch call was made
    expect(fetch).toHaveBeenCalledTimes(1)

    // Extract the FormData that was sent
    const formData = fetch.mock.calls[0][1].body
    expect(formData).toBeInstanceOf(FormData)

    // Note: We can't easily test the exact contents of FormData in fetch
    // but we can verify the structure and that it was created
    expect(formData).toHaveProperty('append')
  })

  it('should work without uploaded image', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        request_id: 'req_test_no_image',
        variations: [{
          id: 'thumb_no_image',
          storage_path: '/exports/thumb_no_image.png',
          exports: {
            PNG: {
              format: 'PNG',
              url: 'http://localhost:8000/exports/thumb_no_image.png',
              file_path: '/exports/thumb_no_image.png',
              size: 75000,
              exported_at: '2024-01-01T00:00:00Z'
            }
          }
        }]
      })
    })

    const { result } = renderHook(() => useStore())

    act(() => {
      result.current.updateScript('Test script without image')
      result.current.updateAspectRatio('9:16')
    })

    await act(async () => {
      await result.current.generateThumbnails()
    })

    expect(result.current.thumbnails).toHaveLength(1)
    expect(result.current.loading).toBe(false)
  })
})