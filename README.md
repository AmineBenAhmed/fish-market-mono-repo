# 🐟 FishMarket

A production-ready marketplace for selling fresh fish.

## Overview

FishMarket connects fish sellers with customers. Sellers publish their daily catch every morning, customers browse products, place orders, pay online, and receive fresh fish deliveries.

### Applications

| Application | Description | Stack |
|-------------|-------------|-------|
| **API** | REST backend | NestJS + Prisma + PostgreSQL + Redis |
| **Admin** | Admin dashboard | React + Vite + Tailwind + Shadcn |
| **Seller** | Seller portal | React + Vite + Tailwind + Shadcn |
| **Website** | Customer storefront | React + Vite + Tailwind + Shadcn |
| **Mobile** | Customer mobile app | React Native + Expo |

### Architecture

This is a **monorepo** managed by TurboRepo with pnpm workspaces. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed decisions and structure.

## Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Docker](https://docker.com/) (optional, for containerized development)

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd fishmarket

# Install dependencies
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/admin/.env.example apps/admin/.env
cp apps/seller/.env.example apps/seller/.env
cp apps/website/.env.example apps/website/.env

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d postgres redis

# Run database migrations
pnpm --filter @fishmarket/api prisma:migrate

# Start development
pnpm dev
```

## Development

```bash
# Start all applications in dev mode
pnpm dev

# Start a specific application
pnpm --filter @fishmarket/api dev
pnpm --filter @fishmarket/website dev

# Lint all projects
pnpm lint

# Build all projects
pnpm build

# Run tests
pnpm test
```

### Individual App Ports

| App | Port |
|-----|------|
| API | 4000 |
| Website | 3000 |
| Admin | 3001 |
| Seller | 3002 |
| PostgreSQL | 5432 |
| Redis | 6379 |

### API Documentation

Once the API is running, visit [http://localhost:4000/api/docs](http://localhost:4000/api/docs) for Swagger documentation.

## Docker

```bash
# Start all services (production-like)
docker compose up --build

# Start only infrastructure
docker compose up -d postgres redis

# Development with hot-reload
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

## Project Structure

```
fishmarket/
├── apps/            # Applications
│   ├── api/         # NestJS backend
│   ├── admin/       # Admin dashboard
│   ├── seller/      # Seller portal
│   ├── website/     # Landing website
│   └── mobile/      # Mobile app
├── packages/        # Shared packages
│   ├── shared/      # Types, constants, utilities
│   ├── ui/          # UI components (shadcn)
│   ├── config-eslint/
│   ├── config-tsconfig/
│   └── config-prettier/
├── docker/          # Dockerfiles
├── docker-compose.yml
└── ARCHITECTURE.md
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

```
feat(api): add product listing endpoint
fix(website): correct cart calculation
chore(deps): upgrade prisma to v6
```

## License

MIT
