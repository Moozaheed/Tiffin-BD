# Docker Deployment Plan Context

## Objective
Run the platform consistently in local, staging, and production using container-first deployment.

## Container Topology
- `backend` (NestJS API + Socket.IO)
- `worker` (ingestion/normalization queue processors)
- `dashboard` (Next.js)
- `mysql`
- `redis` (BullMQ) **or** `rabbitmq` (if selected)
- optional `nginx` gateway

## Compose Strategy
- `docker-compose.yml` (base)
- `docker-compose.override.yml` (local dev)
- `docker-compose.staging.yml`
- `docker-compose.prod.yml`

## Build Strategy
- Multi-stage Dockerfiles for backend/dashboard/worker.
- Runtime images include only production artifacts.
- Non-root runtime user.
- Strict `.dockerignore`.

## Runtime Strategy
- Env-driven config only; no secret in image.
- Startup checks for required env vars.
- Health endpoints:
  - backend: `/health`
  - dashboard: `/api/health`
  - worker: heartbeat/queue ping

## Persistence
- Named volumes:
  - `mysql_data`
  - `redis_data` or `rabbitmq_data`
- Migration job runs before API startup in staging/prod rollout.

## Scaling
- Scale `worker` independently for order bursts.
- Scale `backend` horizontally behind gateway when needed.
- Use queue concurrency settings by environment.

## Operational Baseline
- Restart policies enabled.
- Graceful shutdown for in-flight job safety.
- Structured logs from all containers to central sink.

