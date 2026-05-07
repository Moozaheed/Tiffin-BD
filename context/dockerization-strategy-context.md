# Dockerization Strategy Context

## Containerization Principle
- The project is **container-first**: all core services run via Docker in dev, staging, and production.
- Local setup and CI should use the same container definitions to reduce environment drift.

## Services to Containerize
- `backend` (NestJS API + Socket.IO)
- `dashboard` (Next.js)
- `worker` (queue consumer for notification retry/escalation)
- `mysql` (database)
- `redis` (BullMQ queue backend) or `rabbitmq` (if selected)
- Optional `nginx` reverse proxy for TLS termination/routing

## Image Build Strategy
- Use one Dockerfile per deployable app (`backend`, `dashboard`, `worker`) with multi-stage builds:
  1. dependencies stage
  2. build stage
  3. minimal runtime stage
- Keep runtime images lean (only compiled output + production deps).
- Use explicit image tags per release (avoid floating deploy tags in production rollout).

## Runtime Configuration Strategy
- Keep all env configuration external (`.env`/secret manager); no secrets in image layers.
- Split env files by environment: `.env.local`, `.env.staging`, `.env.production`.
- Validate required env variables on startup; fail fast if missing critical config.

## Networking and Routing
- Use internal Docker network for service-to-service traffic.
- Expose only required public ports (API/dashboard/proxy); keep DB/queue internal.
- Route branch/order traffic through backend only; no direct client-to-DB/queue access.

## Data Persistence
- Use named volumes for MySQL and queue broker durability.
- Keep migration scripts versioned and executed as part of release workflow.
- Define backup/restore process for persistent volumes in staging/production.

## Scaling Strategy
- Scale stateless services horizontally (`backend`, `worker`, optionally `dashboard`).
- Keep queue workers independently scalable from API.
- Use per-branch/global worker concurrency tuning to handle high order bursts.

## Reliability and Operations
- Add health checks for API, dashboard, MySQL, Redis/RabbitMQ.
- Add restart policies and graceful shutdown handling.
- Centralize container logs and include service/container identifiers for tracing.

## Compose Strategy
- Maintain `docker-compose.yml` as base with override files or profiles for:
  - local development
  - staging validation
  - production-like deployment
- Include dedicated test profile for integration/e2e pipelines.

## Security Baseline
- Run application containers with non-root users.
- Minimize installed OS packages in runtime images.
- Regularly scan images for vulnerabilities and patch base images.

