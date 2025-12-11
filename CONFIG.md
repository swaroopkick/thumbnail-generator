# Configuration Documentation

## Environment Variables

The thumbnail generator API uses environment variables for configuration. Create a `.env` file in the `backend` directory with the following variables:

### File Storage Configuration

- `OUTPUT_DIR` (default: `backend/storage/output`)
  - Directory where exported images (PNG, JPEG, WebP) are stored
  - Must be writable by the application

- `TEMP_DIR` (default: `backend/storage/temp`)
  - Temporary directory for intermediate image processing
  - Can be cleaned up periodically

### Image Processing Configuration

- `MAX_VARIATIONS` (default: `5`)
  - Maximum number of thumbnail variations that can be generated per request
  - Requests with count > MAX_VARIATIONS will be limited to this value

- `OUTPUT_QUALITY` (default: `85`)
  - General quality setting for output images (0-100)
  - Used as a reference for other format-specific settings

- `JPEG_QUALITY` (default: `85`)
  - JPEG compression quality (0-100)
  - Higher values preserve more detail but increase file size

- `WEBP_QUALITY` (default: `80`)
  - WebP compression quality (0-100)
  - WebP typically achieves better compression than JPEG at same quality

- `PNG_COMPRESSION` (default: `9`)
  - PNG compression level (0-9)
  - 0 = no compression, 9 = maximum compression
  - PNG is always lossless regardless of this setting

### Gemini API Configuration

- `GEMINI_API_KEY` (required for real API calls)
  - Your Google Generative AI API key
  - If not set, the service will return mock data

- `GEMINI_MODEL_NAME` (default: `gemini-2.0-flash`)
  - The Gemini model to use for image generation
  - Must be a valid model name supported by the Google Generative AI API

- `GEMINI_MAX_RETRIES` (default: `3`)
  - Number of retry attempts for failed API calls
  - Useful for handling rate limits and transient errors

- `GEMINI_RETRY_DELAY` (default: `2`)
  - Initial delay in seconds between retry attempts
  - Exponential backoff is applied: delay * 2^(attempt-1)

### URL Serving Configuration

- `SIGN_URLS` (default: `false`)
  - If `true`: URLs are signed with HMAC-SHA256 and expiry timestamps
  - If `false`: URLs are served via FastAPI StaticFiles at `/static/output/`

- `SERVE_FILES_STATIC` (default: `true`)
  - If `true` and SIGN_URLS is false: configure FastAPI to serve static files
  - Must be `true` if using unsigned URLs

- `URL_SIGNATURE_EXPIRY` (default: `3600`)
  - Expiry time in seconds for signed URLs
  - Default is 1 hour (3600 seconds)

- `SIGNING_SECRET` (default: `default-secret`)
  - Secret key for signing URLs with HMAC
  - Should be set to a secure random value in production
  - Only used if SIGN_URLS is true

## Example Configuration

```env
# File Storage
OUTPUT_DIR=backend/storage/output
TEMP_DIR=backend/storage/temp

# Image Processing
MAX_VARIATIONS=5
JPEG_QUALITY=90
WEBP_QUALITY=85
PNG_COMPRESSION=9

# Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL_NAME=gemini-2.0-flash
GEMINI_MAX_RETRIES=3
GEMINI_RETRY_DELAY=2

# URL Serving
SIGN_URLS=false
SERVE_FILES_STATIC=true
URL_SIGNATURE_EXPIRY=3600
SIGNING_SECRET=your-secret-key-here
```

## Production Recommendations

1. **Directories**: Use absolute paths or ensure relative paths work with your deployment setup
2. **Quality Settings**: Adjust JPEG/WEBP quality based on your use case (80-90 is good for thumbnails)
3. **Expiry Times**: Use shorter expiry times (e.g., 300 seconds) for sensitive operations
4. **Signing Secret**: Use `openssl rand -hex 32` to generate a secure signing secret
5. **API Key**: Store in a secure secret management system, never commit to git
6. **Cleanup**: Set up a cron job or scheduled task to run cleanup periodically

## Cleanup

The `ImageExportService` provides cleanup methods:

```python
from backend.app.services.image_export_service import ImageExportService

service = ImageExportService()

# Clean up temp files older than 1 day
service.cleanup_temp_files(days=1)

# Clean up output files older than 7 days
service.cleanup_output_files(days=7)
```

Or use the convenience function:

```python
from backend.app.utils.cleanup import cleanup_old_files

cleanup_old_files()
```
