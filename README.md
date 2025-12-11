# Thumbnail Generator

A modern, AI-powered thumbnail generation service built with FastAPI, React, TypeScript, and Google Generative AI.

## 📋 Project Structure

```
thumbnail-generator/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application entry point
│   ├── pyproject.toml       # Poetry configuration
│   ├── requirements.txt     # Python dependencies
│   └── README.md
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx         # Main React component
│   │   ├── main.tsx        # Entry point
│   │   ├── index.css       # Global styles with Tailwind
│   │   └── layouts/        # Layout components
│   ├── package.json        # Node dependencies and scripts
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── README.md
├── config/
│   └── .env.example        # Environment variables template
└── README.md               # This file
```

## 🏗️ Architecture

The application follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Layer                        │
│          React + TypeScript + Tailwind CSS              │
│     (Port 5173) - Vite Dev Server                       │
└────────────────────┬────────────────────────────────────┘
                     │
                    HTTP/REST
                     │
┌────────────────────▼────────────────────────────────────┐
│                   API Layer                             │
│            FastAPI (Port 8000)                          │
│         CORS enabled for frontend                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     │
┌────────────────────▼────────────────────────────────────┐
│                  AI Engine                              │
│         Google Generative AI (Gemini)                   │
│    Image Processing with Pillow                         │
│    Thumbnail Generation & Manipulation                  │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- Node.js 16 or higher
- npm or yarn

### 1. Clone and Setup

```bash
git clone <repository-url>
cd thumbnail-generator
```

### 2. Configure Environment

Copy the environment template:
```bash
cp config/.env.example .env
```

Edit `.env` and add your Google Gemini API key:
```bash
GOOGLE_API_KEY=your_api_key_here
```

Get your API key from: https://ai.google.dev/

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# OR using Poetry:
poetry install

# Run the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: `http://localhost:8000`
- API Documentation: `http://localhost:8000/docs`

### 4. Frontend Setup (in a new terminal)

```bash
cd frontend

# Install dependencies
npm install
# OR
yarn install

# Start development server
npm run dev
# OR
yarn dev
```

The frontend will be available at: `http://localhost:5173`

## 📦 Technology Stack

### Backend
- **FastAPI** - Modern web framework for building APIs
- **Python 3.9+** - Programming language
- **Uvicorn** - ASGI server
- **google-generativeai** - Google Generative AI integration
- **Pillow** - Image processing
- **python-multipart** - Multipart form data handling

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next generation frontend tooling
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **@react-three/fiber** - 3D graphics with Three.js
- **Three.js** - 3D JavaScript library

## 📝 Available Scripts

### Backend
```bash
cd backend

# Run development server
uvicorn main:app --reload

# Run with specific host/port
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend

# Development
npm run dev          # Start dev server

# Building
npm run build        # Production build
npm run preview      # Preview production build

# Code quality
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## 🔐 Environment Variables

See `config/.env.example` for all available environment variables:

- `GOOGLE_API_KEY` - Google Generative AI API key (required)
- `BACKEND_URL` - Backend API URL
- `FRONTEND_URL` - Frontend URL
- `VITE_API_BASE_URL` - API base URL for frontend requests
- `OUTPUT_PATH` - Output directory for generated files
- `ENVIRONMENT` - development or production

## 🔄 Development Workflow

1. Start the backend server in one terminal
2. Start the frontend dev server in another terminal
3. Frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:8000`
4. Modify code in both directories for live reload with Vite/Uvicorn

## 📚 API Documentation

Once the backend is running, access the interactive API documentation at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🐛 Troubleshooting

### Backend won't start
- Ensure Python 3.9+ is installed: `python --version`
- Activate virtual environment before running
- Check that port 8000 is not in use

### Frontend won't start
- Ensure Node.js is installed: `node --version`
- Delete `node_modules` and run `npm install` again
- Check that port 5173 is not in use

### API connection issues
- Ensure backend is running on `http://localhost:8000`
- Check CORS configuration in `backend/main.py`
- Verify API base URL in frontend configuration

## 📄 License

MIT License - feel free to use this project for your own purposes.
