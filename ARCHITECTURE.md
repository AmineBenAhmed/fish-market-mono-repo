# FishMarket — Architecture

## Overview

FishMarket is a production-ready marketplace for selling fresh fish. It connects sellers with customers in local markets. The platform generates revenue through marketplace commissions and delivery fees.

The project is a **monorepo** managed by **TurboRepo** with **pnpm** workspaces. This architecture was chosen for:

- **Code sharing** — shared types, utilities, and UI components across all applications
- **Consistent tooling** — single ESLint, Prettier, and TypeScript configuration
- **Simplified dependencies** — single `node_modules` at the root
- **Orchestrated builds** — TurboRepo caches and parallelizes builds
- **Future microservice migration** — each app can be extracted into its own repository when needed

---

## Applications

| App | Package | Tech | Port | Description |
|-----|---------|------|------|-------------|
| API | `@fishmarket/api` | NestJS + Prisma + PostgreSQL + Redis | 4000 | REST API with Swagger docs |
| Admin | `@fishmarket/admin` | React + Vite + Tailwind + Shadcn | 3001 | Admin dashboard |
| Seller | `@fishmarket/seller` | React + Vite + Tailwind + Shadcn | 3002 | Seller portal |
| Website | `@fishmarket/website` | React + Vite + Tailwind + Shadcn | 3000 | Landing page & customer storefront |
| Mobile | `@fishmarket/mobile` | Expo + React Native | — | Customer mobile app |

---

## Shared Packages

| Package | Description |
|---------|-------------|
| `@fishmarket/shared` | Pure TypeScript package with types, constants, and utilities used by all apps |
| `@fishmarket/ui` | Shared React component library based on shadcn/ui with Tailwind |
| `@fishmarket/config-eslint` | Centralized ESLint configuration |
| `@fishmarket/config-tsconfig` | Shared TypeScript base configurations (base, react, react-native, nest) |
| `@fishmarket/config-prettier` | Shared Prettier configuration |

---

## Folder Structure

```
fishmarket/
├── apps/                      # Application packages
│   ├── api/                   # NestJS backend
│   │   ├── prisma/            # Database schema and migrations
│   │   ├── src/
│   │   │   ├── config/        # Environment and app configuration
│   │   │   ├── common/        # Shared decorators, filters, guards, interceptors
│   │   │   └── modules/       # Feature modules (auth, users, products, etc.)
│   │   └── test/              # E2E tests
│   ├── admin/                 # React admin dashboard
│   ├── seller/                # React seller portal
│   ├── website/               # React landing website
│   └── mobile/                # React Native (Expo) app
├── packages/                  # Shared packages
│   ├── shared/                # Types, constants, utilities
│   ├── ui/                    # shadcn/ui component library
│   ├── config-eslint/         # ESLint config
│   ├── config-tsconfig/       # TypeScript configs
│   └── config-prettier/       # Prettier config
├── docker/                    # Dockerfiles
├── .husky/                    # Git hooks
├── .vscode/                   # Workspace recommendations
├── turbo.json                 # TurboRepo pipeline
└── package.json               # Root workspace config
```

---

## Key Decisions

### Why TurboRepo over Nx?

TurboRepo was chosen over Nx because:

- **Simplicity** — zero-config setup, minimal boilerplate
- **Speed** — faster than Nx for this project size
- **Caching** — built-in remote caching (shared across team)
- **Lightweight** — fewer concepts to learn (no generators, no executors)
- **Sufficient** — the project does not need Nx's advanced CI features at this stage

### Why feature-based modules in the API?

NestJS applications are organized by business domain (auth, users, products, orders, etc.). Each domain is a self-contained module with its own:

- Controller
- Service
- DTOs
- Guards
- Tests

This makes it trivial to extract any module into a separate microservice later.

### Why a shared UI package?

All three web apps (admin, seller, website) use the same design system (shadcn/ui). Having a single `@fishmarket/ui` package:

- Eliminates component duplication
- Guarantees visual consistency
- Simplifies theme changes
- One version of Tailwind configuration

### Why Zustand over Redux?

Zustand was chosen for state management because:

- Minimal boilerplate (no actions, reducers, or providers)
- TypeScript-first API
- Works identically in React and React Native
- Simple enough for this project's state needs

### Why Prisma?

Prisma was chosen as the ORM because:

- Type-safe database access (generated types)
- Auto-generated migrations
- Great DX with Prisma Studio
- Easy to model complex relationships (products, orders, users)

---

## Design Principles

1. **Keep it simple** — avoid over-engineering. Solve today's problems today.
2. **Composition over inheritance** — prefer composing small, focused modules.
3. **Explicit over implicit** — make dependencies and data flow clear.
4. **Fail early** — validate inputs at boundaries (API layer, form submission).
5. **Test the contract** — focus integration tests on API contracts, not implementation details.
6. **Separate concerns** — each file has one responsibility.
7. **Convention over configuration** — follow framework conventions unless there's a compelling reason not to.

---

## Development Workflow

```bash
# Install dependencies
pnpm install

# Start all apps in dev mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Run tests
pnpm test
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

Types: feat, fix, chore, docs, refactor, test, style
Scopes: api, admin, seller, website, mobile, shared, ui, config, root, deps, docs
```

---

## Roadmap

### Phase 2 — Core Infrastructure (Next)
- Prisma schema for users, products, and orders
- Authentication module (JWT + Passport)
- User CRUD
- Product CRUD
- File upload for product images
- Basic admin dashboard layout
- Seller portal layout
- Website landing page

### Phase 3 — Marketplace Features
- Order placement workflow
- Payment integration (Stripe)
- Delivery management
- Real-time order tracking (WebSockets)
- Search and filtering
- Rating and reviews

### Phase 4 — Operations
- Analytics dashboard
- Notification system (email + push)
- Multi-city support
- Performance monitoring
- CI/CD pipeline
- Load testing

### Phase 5 — Scale
- Horizontal scaling
- Microservice extraction
- CDN for images
- Caching strategy
- Database read replicas
