.PHONY: dev build preview lint install db-up down db-push db-shell up stop clean help

help: ## Tampilkan semua commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Jalankan dev server
	pnpm dev

build: ## Build production
	pnpm build

preview: build ## Build + jalankan production server
	pnpm start

lint: ## Run ESLint
	pnpm lint

install: ## Install dependencies
	pnpm install

db-up: ## Start PostgreSQL (Docker)
	docker compose up -d db

down: ## Stop semua containers
	docker compose down

db-push: ## Push schema ke database
	pnpm db:push

db-shell: ## Buka psql shell ke database
	docker compose exec db psql -U $${POSTGRES_USER:-tambangan} -d $${POSTGRES_DB:-tambangan}

up: ## Start app + DB di Docker
	docker compose up -d --build

stop: ## Stop semua containers
	docker compose down

clean: ## Clean build artifacts
	rm -rf .next node_modules/.cache
