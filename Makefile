.PHONY: help setup dev backend frontend lint format clean docker-up docker-down

help:
	@echo "Thumbnail Generator - Development Commands"
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make setup          - Set up the entire project (Python venv, npm install, etc)"
	@echo ""
	@echo "Development:"
	@echo "  make dev            - Start both backend and frontend (requires 2 terminals)"
	@echo "  make backend        - Start backend development server only"
	@echo "  make frontend       - Start frontend development server only"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint           - Lint frontend code"
	@echo "  make format         - Format all code"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up      - Start services with Docker Compose"
	@echo "  make docker-down    - Stop Docker Compose services"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean          - Clean build artifacts and cache"

setup:
	@bash setup.sh

dev:
	@echo "Starting development servers..."
	@echo "Backend will run on http://localhost:8000"
	@echo "Frontend will run on http://localhost:5173"
	@echo ""
	@echo "Run in separate terminals:"
	@echo "  Terminal 1: make backend"
	@echo "  Terminal 2: make frontend"

backend:
	cd backend && source venv/bin/activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000

frontend:
	cd frontend && npm run dev

lint:
	cd frontend && npm run lint

format:
	cd frontend && npm run format

clean:
	@echo "Cleaning build artifacts..."
	@find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	@rm -rf frontend/dist frontend/node_modules
	@echo "✅ Cleanup complete"

docker-up:
	docker-compose up -d
	@echo "Services are running:"
	@echo "  Backend: http://localhost:8000"
	@echo "  Frontend: http://localhost:5173"

docker-down:
	docker-compose down
	@echo "Services stopped"
