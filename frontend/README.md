# Thumbnail Generator Frontend

React + TypeScript frontend for the Thumbnail Generator application using Vite, TailwindCSS, and Framer Motion.

## Tech Stack

- **Vite**: Fast build tool and dev server
- **React 18**: UI library
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **@react-three/fiber**: 3D graphics with Three.js
- **Three.js**: 3D JavaScript library

## Setup

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Configure environment variables:
```bash
cp ../config/.env.example .env.local
```

Edit `.env.local` and update the API server URL if needed.

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:5173`

## Building

Create a production build:
```bash
npm run build
# or
yarn build
```

Preview the production build locally:
```bash
npm run preview
# or
yarn preview
```

## Linting and Formatting

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```
