.PHONY: help install dev backend frontend test test-backend test-frontend build docker-up docker-down

help:
	@echo "CRIMENET-X - AI Criminal Network Intelligence Platform"
	@echo "Available commands:"
	@echo "  make install        Install Python and Node dependencies"
	@echo "  make dev            Run both backend and frontend concurrently"
	@echo "  make backend        Run FastAPI backend server"
	@echo "  make frontend       Run Next.js dev server"
	@echo "  make test           Run backend pytest test suite"
	@echo "  make build          Build production artifacts"
	@echo "  make docker-up      Start PostgreSQL, Neo4j, Backend, and Frontend in Docker"
	@echo "  make docker-down    Stop Docker services"

install:
	pip install -r backend/requirements.txt
	cd frontend && npm install

backend:
	cd backend && python main.py

frontend:
	cd frontend && npm run dev

test:
	pytest backend/tests -v

build:
	cd frontend && npm run build

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down
