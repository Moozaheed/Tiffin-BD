# TiffinBD - Claude Code Project Instructions

This file contains project-specific instructions for Claude Code when working on the TiffinBD project.

## Project Identity

- **Project**: TiffinBD (Real-Time Order Notification & Alert System)
- **Client**: Tiffin (Brain Station 23)
- **Duration**: 8 Weeks (April 29 - June 23, 2026)
- **Current Phase**: Week 3 - CONSTRUCTION (Branch Management & Order Ingestion)
- **Stack**: NestJS (TypeScript), Next.js (Dashboard), React Native (Mobile), MySQL (TypeORM), Redis (BullMQ), Docker, Socket.IO, Firebase Cloud Messaging

## Architecture Overview

### Backend (NestJS)

```
backend/src/
├── main.ts                    # Bootstrap with global pipes, guards, interceptors
├── app.module.ts              # Root module importing all feature modules
├── config/                    # Environment validation and config service
├── database/
│   ├── entities/index.ts      # 10 TypeORM entities (Branches, Roles, Users, etc.)
│   └── repositories/index.ts  # 10 typed repositories with custom query methods
├── common/
│   ├── guards/                # JwtGuard, RolesGuard, BranchGuard
│   ├── decorators/            # @Public, @Roles, @Branch, @CurrentUser, @CurrentBranch, @Throttle
│   ├── interceptors/          # LoggingInterceptor, ErrorInterceptor
│   ├── exceptions/            # ValidationException, AuthenticationException, etc.
│   ├── logger/                # Bunyan structured logging with correlation IDs
│   └── constants/             # Enums (UserRole, OrderStatus, etc.), feature flags, pagination
├── health/                    # /health, /health/live, /health/ready endpoints
└── modules/
    ├── auth/                  # JWT authentication (login, refresh, logout)
    ├── users/                 # User CRUD with password management
    ├── branches/              # Branch management and configuration
    ├── ingestion/             # Multi-source order ingestion (website, 3rd party, Chilli POS)
    ├── normalization/         # Order normalization and validation
    ├── orders/                # Order lifecycle management
    ├── notifications/         # Socket.IO + FCM notification delivery
    ├── escalation/            # Retry and escalation engine
    ├── analytics/             # Operational metrics and dashboards
    └── printing/              # Print job management and auto-print
```

### Database Entities (MySQL 8.0 + TypeORM)

10 core entities: `Branches`, `Roles`, `Users`, `UserBranchRoles`, `Devices`, `SourceConnectors`, `RawOrders`, `NormalizedOrders`, `NormalizationErrors`, `AuditLogs`

### Frontend Dashboard (Next.js 14+)

- Tailwind CSS, Socket.IO real-time, role-based views
- Super Admin, Branch Manager, and Kitchen/Staff dashboards

### Mobile App (React Native)

- FCM push notifications, Socket.IO real-time, AsyncStorage for session persistence
- Order queue, accept, reprint functionality

## Coding Standards

### Naming Conventions

- Files: `kebab-case.ts` (e.g., `order-routing.service.ts`)
- Classes: `PascalCase` (e.g., `OrderRoutingService`)
- Variables/functions: `camelCase` (e.g., `assignBranch`)
- Constants: `UPPER_SNAKE_CASE`
- Enums: `PascalCase` with `UPPER_SNAKE_CASE` values

### Module Structure

Each feature module follows this pattern:

```
modules/<feature>/
├── <feature>.module.ts        # NestJS module definition
├── <feature>.service.ts       # Business logic
├── <feature>.controller.ts    # REST API endpoints
└── dto/
    ├── create-<feature>.dto.ts
    ├── update-<feature>.dto.ts
    └── <feature>-response.dto.ts
```

### Technical Requirements

- TypeScript strict mode enabled
- All DTOs use `class-validator` decorators for validation
- Global `ValidationPipe` with `whitelist: true, forbidNonWhitelisted: true, transform: true`
- Global `JwtGuard` applied - use `@Public()` for unauthenticated routes
- Structured logging via `LoggerService` (Bunyan) with correlation IDs
- All environment variables validated at startup via `EnvironmentVariables` class
- Repositories extend TypeORM `Repository` with custom methods
- Use existing exceptions from `common/exceptions/` (not raw HttpException)

### Security Rules

- Secrets in `.env` only - never hardcode credentials
- SQL injection prevention via TypeORM parameterized queries
- Non-root Docker users (nodejs:1001)
- CORS configured in `main.ts`
- JWT access + refresh token pattern
- Branch-level authorization via `BranchGuard`
- Role-based access via `RolesGuard` with 6-tier RBAC

### Testing

- Jest with `ts-jest` transformer
- Path aliases configured (`@/`, `@modules/`, `@common/`, `@config/`, `@database/`)
- Coverage targets: >70% for critical modules, >80% for auth

### Docker

- Multi-stage Dockerfile (builder + runtime)
- Services: backend, MySQL 8.0, Redis 7-alpine
- `docker-compose.yml` (base) + `docker-compose.override.yml` (dev)
- Health checks on all containers

## 8-Week Project Plan

| Week | Focus | Status |
|------|-------|--------|
| 1 | Foundation & Infrastructure | COMPLETE |
| 2 | Authentication & Authorization | COMPLETE |
| 3 | Branch Management & Order Ingestion | COMPLETE |
| 4 | Order Normalization & Branch Routing | Planned |
| 5 | Real-Time Notifications & Escalation | Planned |
| 6 | Dashboard System & Printing | Planned |
| 7 | Mobile App Development | Planned |
| 8 | Deployment, Testing & Launch | Planned |

## Week 2 Deliverables

- JWT authentication (login, refresh tokens, logout)
- 6-tier RBAC: SUPER_ADMIN, ADMIN, BRANCH_MANAGER, OPERATOR, VIEWER, API_USER
- User CRUD endpoints with pagination
- Branch assignment and device binding
- Device registration for FCM tokens
- Rate limiting on login attempts
- Account lockout after failed attempts
- Auth test coverage >80%

## API Design Patterns

- Prefix: `/api/v1`
- Auth: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- Users: `POST /users`, `GET /users`, `GET /users/:id`, `PUT /users/:id`, `DELETE /users/:id`
- Branches: CRUD at `/branches`
- Devices: `POST /devices/register`
- All responses use consistent envelope: `{ statusCode, message, data, timestamp }`

## Performance Targets

- Order routing: <10 seconds end-to-end
- Notification delivery: <5 seconds
- Dashboard page load: <2 seconds
- Health check: <100ms
- Order throughput: 100+ orders/second

## Key Context Files

- `Documents/WEEKLY_PROJECT_PLAN.md` - Full 8-week breakdown
- `Documents/PROJECT_PLAN_SUMMARY.md` - Architecture and module details
- `context/` directory - Detailed context for each subsystem
- `aidlc-docs/` - AI-DLC workflow state and audit logs

## AI-DLC Workflow

This project follows the AI-Driven Development Life Cycle. When requested:
- Read `.aidlc/aws-aidlc-rules/core-workflow.md` for stage definitions
- Update `aidlc-docs/aidlc-state.md` on stage transitions
- Log interactions in `aidlc-docs/audit.md` with ISO 8601 timestamps
