# Configuration

This directory contains shared configuration and environment variable templates for the Thumbnail Generator project.

## Environment Variables

Copy `.env.example` to `.env` in both the backend and frontend directories:

### Backend
```bash
cp .env.example ../backend/.env
```

### Frontend
```bash
cp .env.example ../frontend/.env.local
```

### Environment Variables Reference

- **GOOGLE_API_KEY**: Your Google Generative AI API key (required)
  - Get it from: https://ai.google.dev/
  
- **BACKEND_HOST**: The host address for the backend server (default: 0.0.0.0)
- **BACKEND_PORT**: The port for the backend server (default: 8000)
- **BACKEND_URL**: Full URL to the backend (used by frontend for API calls)

- **FRONTEND_URL**: Full URL to the frontend (used by backend for CORS configuration)
- **VITE_API_BASE_URL**: Base URL for API calls from frontend

- **OUTPUT_PATH**: Directory to store generated files
- **THUMBNAILS_PATH**: Directory specifically for thumbnail outputs
- **TEMP_PATH**: Temporary directory for processing

- **ENVIRONMENT**: Set to 'development' or 'production'
- **DEBUG**: Enable debug logging (true/false)
