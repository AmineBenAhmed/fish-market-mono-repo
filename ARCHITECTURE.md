# FishMarket — Architecture

## Overview

FishMarket is a production-ready marketplace for selling fresh fish. It connects sellers with customers in local markets. The platform generates revenue through marketplace commissions and delivery fees.

The project is a **monorepo** managed by **TurboRepo** with **pnpm** workspaces.

---

## Applications

| App     | Package               | Tech                                 | Port | Description                        |
| ------- | --------------------- | ------------------------------------ | ---- | ---------------------------------- |
| API     | `@fishmarket/api`     | NestJS + Prisma + PostgreSQL + Redis | 4000 | REST API with Swagger docs         |
| Admin   | `@fishmarket/admin`   | React + Vite + Tailwind + Shadcn     | 3001 | Admin dashboard                    |
| Seller  | `@fishmarket/seller`  | React + Vite + Tailwind + Shadcn     | 3002 | Seller portal                      |
| Website | `@fishmarket/website` | React + Vite + Tailwind + Shadcn     | 3000 | Landing page & customer storefront |
| Mobile  | `@fishmarket/mobile`  | Expo + React Native                  | —    | Customer mobile app                |

---

## Shared Packages

| Package                       | Description                                                                   |
| ----------------------------- | ----------------------------------------------------------------------------- |
| `@fishmarket/shared`          | Pure TypeScript package with types, constants, and utilities used by all apps |
| `@fishmarket/ui`              | Shared React component library based on shadcn/ui with Tailwind               |
| `@fishmarket/config-eslint`   | Centralized ESLint configuration                                              |
| `@fishmarket/config-tsconfig` | Shared TypeScript base configurations (base, react, react-native, nest)       |
| `@fishmarket/config-prettier` | Shared Prettier configuration                                                 |

---

## Production Architecture

```
                         ┌─────────────┐
                         │   Cloudflare │
                         │   (DNS/CDN)  │
                         └──────┬──────┘
                                │
                         ┌──────┴──────┐
                         │  Nginx/ALB  │
                         │  (Reverse   │
                         │   Proxy)    │
                         └──────┬──────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
    ┌──────┴──────┐    ┌───────┴───────┐    ┌───────┴───────┐
    │  /api/*     │    │  /admin/*     │    │  /seller/*    │
    │  fishmarket-│    │  fishmarket-  │    │  fishmarket-  │
    │  api:4000   │    │  admin:3001   │    │  seller:3002  │
    └──────┬──────┘    └───────────────┘    └───────────────┘
           │
    ┌──────┴──────┐
    │   Redis     │
    │  (Cache +   │
    │   Jobs)     │
    └──────┬──────┘
           │
    ┌──────┴──────┐
    │ PostgreSQL  │
    │  (Primary)  │
    └─────────────┘
```

### Deployment Options

**Option A — Single VPS (MVP)**: All services run via `docker-compose` on a single VM. Suitable for up to ~1,000 daily active users.

**Option B — Scalable Cloud (Production)**: Each service runs on separate infrastructure with load balancing and horizontal scaling.

---

## Infrastructure Components

### Docker

- **Dockerfile.api**: Multi-stage build for NestJS. Builder stage compiles TypeScript, runner stage is minimal `node:20-alpine` with only production dependencies. HEALTHCHECK pings `/api/v1/health`.
- **Dockerfile.web**: Multi-stage for React apps. Builds with pnpm, serves via `nginx:alpine`. HEALTHCHECK pings root.
- **docker-compose.yml**: All services (postgres, redis, api, admin, seller, website) with health checks and dependency ordering.
- **docker-compose.dev.yml**: Dev overrides with hot-reload volume mounts.

### CI/CD (GitHub Actions)

- **ci.yml**: Runs on push/PR to master/develop. Stages: lint → typecheck → test → build → docker build.
- **deploy.yml**: On successful CI to master, builds and pushes Docker images to GHCR, then deploys via SSH.

### Caching (Redis)

Custom `CacheService` wrapping ioredis with `get`, `set`, `del`, `delPattern`, and `getOrSet`. TTL configurable per key. Used for marketplace listings, seller dashboards, and frequent queries.

### Background Jobs (BullMQ)

Three queues:

- **orders**: Order expiration scheduling and processing
- **notifications**: Async notification dispatch
- **cleanup**: Periodic cleanup tasks

### Observability

- **Structured logging**: Logger metadata includes `requestId`, `method`, `url`, `statusCode`, `elapsed`. Correlation ID via `x-request-id` header/middleware.
- **Health checks**: `/api/v1/health` checks database and Redis connectivity.
- **Sentry ready**: Error tracking integration prepared (add `SENTRY_DSN` env var).

### Security

| Measure       | Implementation                                                     |
| ------------- | ------------------------------------------------------------------ |
| Rate limiting | 3 tiers: global (100/min), auth (10/min), marketplace (200/min)    |
| Helmet        | Security headers (CSP disabled for API)                            |
| CORS          | Whitelist of allowed origins                                       |
| Validation    | Global ValidationPipe with whitelist + forbidNonWhitelisted        |
| JWT           | Access tokens with configurable expiration, refresh token rotation |
| SQL injection | Prevented by Prisma parameterized queries                          |

---

## Backend Architecture (NestJS)

### Module Structure

Each domain is a self-contained NestJS module:

- **Controller** — HTTP endpoints with Swagger decorators
- **Service** — Business logic
- **DTO** — Request/response validation with class-validator
- **Tests** — Jest unit tests

### Global Providers

| Provider               | Purpose                                             |
| ---------------------- | --------------------------------------------------- |
| `AllExceptionsFilter`  | Catches all unhandled exceptions                    |
| `JwtAuthGuard`         | Validates JWT on every request (unless `@Public()`) |
| `RolesGuard`           | Checks user role against `@Roles()` decorator       |
| `PermissionsGuard`     | Checks granular permissions                         |
| `ThrottlerGuard`       | Rate limiting                                       |
| `LoggingInterceptor`   | Structured request logging                          |
| `TransformInterceptor` | Wraps responses in `{ success, data }` format       |

### Database (Prisma + PostgreSQL)

- 24 models covering users, products, orders, payments, deliveries, notifications, and audit
- Full-text search via PostgreSQL `tsvector`
- Connection pooling via Prisma's internal pool (configurable via `DATABASE_URL` pool size)
- Indexes on foreign keys, status fields, and date-based query columns

---

## Key Decisions

### Why TurboRepo over Nx?

Simplicity and zero-config. Sufficient for this project size.

### Why feature-based modules?

Each domain is self-contained, making microservice extraction trivial.

### Why Prisma?

Type-safe database access with auto-generated migrations and great DX.

### Why Zustand over Redux?

Minimal boilerplate, TypeScript-first, works in React and React Native identically.

---

## API Versioning

All endpoints live under `/api/v1/`. No breaking changes should be introduced without incrementing the version prefix (`/api/v2/`).

---

## Development

```bash
pnpm install
pnpm dev          # All apps in dev mode
pnpm build        # Build all apps
pnpm lint         # Lint all apps
pnpm test         # Run all tests
pnpm --filter @fishmarket/api prisma:studio
```

### Commit Convention

```
<type>(<scope>): <description>
Types: feat, fix, chore, docs, refactor, test, style
Scopes: api, admin, seller, website, mobile, shared, ui, config, root, deps, docs
```

---

## Environment Variables

| Variable                 | Required | Description                                |
| ------------------------ | -------- | ------------------------------------------ |
| `NODE_ENV`               | ✓        | `development` \| `staging` \| `production` |
| `DATABASE_URL`           | ✓        | PostgreSQL connection string               |
| `REDIS_URL`              | ✓        | Redis connection string                    |
| `JWT_SECRET`             | ✓        | JWT signing secret (256-bit random)        |
| `JWT_EXPIRATION`         |          | Access token TTL (default: `15m`)          |
| `JWT_REFRESH_EXPIRATION` |          | Refresh token TTL (default: `7d`)          |
| `APP_URL`                |          | CORS origin(s), comma-separated            |
| `SENTRY_DSN`             |          | Sentry error tracking DSN                  |
| `STRIPE_SECRET_KEY`      |          | Stripe API key                             |
| `STRIPE_WEBHOOK_SECRET`  |          | Stripe webhook signing secret              |
| `SMTP_*`                 |          | Email provider credentials                 |
| `AWS_ACCESS_KEY_ID`      |          | AWS S3 key (file uploads)                  |
| `GOOGLE_MAPS_API_KEY`    |          | Maps API key (future)                      |

---

## Maintenance

### Backups

- PostgreSQL: `docker exec fishmarket-postgres pg_dump -U fishmarket fishmarket > backup_$(date +%Y%m%d).sql`
- Automate with cron: daily backup, retain 30 days, off-site copy via S3/rsync.

### Deployment Rollback

```bash
# Revert to previous Docker image tag
docker compose up -d api=<previous-tag>
```

### Prisma Migrations

```bash
pnpm --filter @fishmarket/api prisma:migrate:prod   # Apply pending migrations
pnpm --filter @fishmarket/api prisma:migrate dev     # Create new migration
```

Always backup the database before applying migrations in production.

### Scaling Strategy

1. **Vertical** — Increase VPS resources (CPU/RAM). Good for initial growth.
2. **Horizontal** — Split services across machines:
   - API instances behind load balancer
   - Read replicas for PostgreSQL
   - Redis cluster for caching layer
3. **CDN** — Serve static assets via Cloudflare/CDN
4. **Caching** — Add Redis caching for marketplace and dashboard queries
5. **Queue workers** — Scale BullMQ workers independently for background jobs
