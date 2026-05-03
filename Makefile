.PHONY: help install install-root install-frontend spec-compile dev frontend-dev frontend-build frontend-preview frontend-test mock-api backend-dev backend-test docker-build docker-run

APP_IMAGE ?= call-booking-app
PORT ?= 3000
VITE_API_BASE_URL ?= http://localhost:3000

help:
	@printf "Available targets:\n"
	@printf "  make install          Install root and frontend dependencies\n"
	@printf "  make spec-compile     Compile TypeSpec contract to OpenAPI\n"
	@printf "  make dev              Run backend and frontend together\n"
	@printf "  make frontend-dev     Run Vite frontend against backend URL\n"
	@printf "  make frontend-build   Build frontend production assets\n"
	@printf "  make frontend-preview Preview built frontend\n"
	@printf "  make frontend-test    Run frontend Playwright tests\n"
	@printf "  make mock-api         Run Prism mock API on port 4010\n"
	@printf "  make backend-dev      Run Go backend\n"
	@printf "  make backend-test     Run Go backend tests\n"
	@printf "  make docker-build     Build Docker image\n"
	@printf "  make docker-run       Run Docker image on PORT\n"

install: install-root install-frontend

install-root:
	npm install

install-frontend:
	npm install --prefix frontend

spec-compile:
	npm run spec:compile

dev: spec-compile
	$(MAKE) -j2 backend-dev frontend-dev

frontend-dev:
	VITE_API_BASE_URL=$(VITE_API_BASE_URL) npm run dev --prefix frontend

frontend-build:
	npm run build --prefix frontend

frontend-preview:
	npm run preview --prefix frontend

frontend-test:
	npm run test:e2e --prefix frontend

mock-api:
	npm run mock:api --prefix frontend

backend-dev:
	cd backend && go run .

backend-test:
	cd backend && go test ./...

docker-build:
	docker build -t $(APP_IMAGE) .

docker-run:
	docker run --rm -e PORT=$(PORT) -p $(PORT):$(PORT) $(APP_IMAGE)
