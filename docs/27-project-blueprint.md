# 27 - Project Blueprint

## Purpose

This document turns the OpenWA codebase into a reusable blueprint for future projects.

Use it as a **default starting point**, not as a rigid template. The goal is to preserve the
engineering discipline, modular structure, and UI organization that work well here, while adapting
the implementation to the needs of each new product.

## Core Style to Reuse

### 1. Prefer clear module boundaries

Split the backend by business capability, not by technical layer alone.

Good:

- `modules/auth`
- `modules/orders`
- `modules/invoices`

Avoid:

- one giant `services/`
- one giant `controllers/`
- cross-feature logic scattered through helpers

### 2. Keep transport thin, move behavior into services

Controllers should handle:

- routing
- auth decorators / access control
- DTO validation
- response metadata

Services should handle:

- business rules
- orchestration
- state transitions
- concurrency / retry logic
- storage access
- external integrations

### 3. Use typed boundaries everywhere

Default to:

- DTOs for request/response contracts
- typed service inputs/outputs
- explicit entity models
- typed frontend API interfaces

Avoid passing loose untyped objects across layers unless there is a real reason.

### 4. Build for operations early

This repo is strong because operational concerns are not treated as an afterthought.

Carry forward:

- environment-driven configuration
- Docker readiness
- migrations
- health endpoints
- rate limiting where needed
- structured logging
- graceful shutdown
- explicit failure handling

### 5. Comment the reasoning, not the obvious

Short comments are used to explain:

- why a guard exists
- why a race condition is handled a certain way
- why a fallback is safe
- why a module is conditionally loaded

Do not fill files with narration.

## Recommended Project Shape

```text
project-name/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/               # shared utils, guards, errors, transformers
│   ├── config/               # env loading, validation, runtime config
│   ├── core/                 # cross-cutting framework code
│   ├── database/             # data sources, migrations, db helpers
│   ├── integrations/         # external systems, SDK wrappers, adapters
│   └── modules/
│       ├── auth/
│       ├── users/
│       ├── feature-a/
│       └── feature-b/
├── test/                     # e2e / integration tests
├── dashboard/                # React frontend if the product has an admin UI
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── types/
│   │   └── i18n/
├── docs/
├── scripts/
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Standard Backend Slice

For each feature module, prefer this shape:

```text
src/modules/example/
├── dto/
│   ├── create-example.dto.ts
│   ├── update-example.dto.ts
│   └── index.ts
├── entities/
│   └── example.entity.ts
├── example.controller.ts
├── example.service.ts
├── example.module.ts
└── example.service.spec.ts
```

Optional additions when the feature needs them:

- `guards/`
- `utils/`
- `adapters/`
- `events/`
- `repositories/`

Only add extra abstraction when it reduces real complexity.

## Standard Frontend Slice

For React admin/dashboard projects, prefer:

```text
dashboard/src/
├── components/              # shared UI blocks
├── hooks/                   # reusable state/query hooks
├── pages/                   # route-level pages
├── services/                # API client + request types
├── utils/                   # pure helpers
├── i18n/                    # translations
├── App.tsx
├── main.tsx
└── index.css
```

Recommended frontend rules:

- Keep API calls centralized in `services/api.ts`
- Keep query keys and React Query hooks centralized in `hooks/queries.ts`
- Use page-local CSS files when the page has meaningful layout/styling
- Use global CSS only for tokens, typography, modals, resets, and cross-app primitives
- Keep UI text in English by default

## Naming Rules

- Files: `kebab-case`
- Classes / React components / enums: `PascalCase`
- Functions / variables / hooks: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- DTO files: `*.dto.ts`
- Entity files: `*.entity.ts`
- Test files: `*.spec.ts` or `*.test.ts`

## Architecture Rules Worth Preserving

### Backend

- Controllers should not reach directly into low-level engine/integration internals
- Put business policy in services, not decorators or controllers
- Validate inputs at the boundary
- Keep database schema changes migration-driven
- Make optional subsystems explicitly conditional via config
- Prefer predictable defaults over magic

### Frontend

- Put network and serialization concerns in the API layer
- Normalize unstable backend payloads at the data boundary where practical
- Separate route structure from page layout components
- Prefer boring, durable UI over decorative complexity
- Treat accessibility and keyboard behavior as part of the implementation

## Visual Style to Reuse

The OpenWA dashboard style is:

- clean and functional
- card-based
- soft borders and moderate rounding
- restrained shadows
- muted neutrals with a stronger primary accent
- roomy spacing
- readable typography
- practical icon usage

Do not interpret this as a requirement to use plain CSS only. The visual language can be recreated
with CSS modules, Tailwind, or another styling system if the project benefits from it.

What should stay consistent is the design attitude:

- operational UI first
- clear hierarchy
- low visual noise
- fast scanning

## Default Stack Recommendation

Use this by default unless the project strongly needs something else:

### Backend

- Node.js
- TypeScript
- NestJS for API-heavy modular services
- TypeORM or another migration-first ORM
- PostgreSQL for production data
- Docker / Docker Compose

### Frontend

- React
- TypeScript
- Vite
- TanStack Query

### Infrastructure

- `.env`-driven configuration
- health checks
- structured logs
- container-ready startup

## What to Copy Directly

- folder layout
- feature module boundaries
- DTO/entity/service/controller split
- centralized frontend API layer
- query hook organization
- environment/config discipline
- production-minded comments
- docs-first thinking for architecture and operations

## What to Adapt Per Project

- exact framework choice
- auth model
- queueing strategy
- cache strategy
- persistence model
- styling technology
- deployment topology

Do not force every project to look like OpenWA if the problem is simpler.

## Starter Checklist

When beginning a new project based on this blueprint:

1. Define the main backend feature modules first.
2. Decide which concerns belong in `common`, `core`, and `integrations`.
3. Set env validation and config loading before feature work grows.
4. Add migration support before the schema becomes unstable.
5. Create the frontend API layer before building many pages.
6. Keep English UI copy as the default unless the product requires otherwise.
7. Add operational endpoints and logging early.
8. Document architectural decisions while they are still small.

## Working Rule for Future Projects

When asked to create a new project "in the OpenWA style", the default interpretation should be:

- modular backend
- strong typing
- thin controllers
- service-centered logic
- centralized frontend data access
- clean admin-style UI
- production-aware engineering defaults

That means **copy the discipline**, not necessarily the exact technology or domain model.
