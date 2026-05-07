# Coding Guidelines Context

## Development Approach
- Follow **context/spec-driven development**: implement from explicit requirements and behavior specs.
- Prefer a **documentation-first** workflow where specs are the source for implementation decisions.
- Use AI-assisted generation to speed delivery, but keep human review for business-critical logic.
- Maintain production-grade engineering standards from day one (no temporary shortcuts in core flows).

## Quality and Reliability Priorities
- Real-time behavior and branch routing are business-critical; prioritize correctness over convenience.
- Notification flows must be resilient: retries, escalation, delivery feedback, and explicit failure handling.
- Ensure idempotent handling for repeated/duplicate order events from external sources.
- Keep strict auditability through structured logs for every major order and notification event.
- Design for high-throughput concurrency (multiple orders per second) without race conditions or status conflicts.

## Service Design Guidelines
- Use modular services: ingestion, normalization, routing, notifications, escalation, dashboard/mobile sync.
- Define clear event contracts for order lifecycle transitions.
- Keep branch-based authorization and data visibility boundaries explicit.
- Avoid hard-coded branch/user mappings; keep configuration-driven rules.
- Use queue-first processing and backpressure controls for burst traffic in single or multiple branches.
- Enforce auth-to-branch binding at login (device session inherits branch scope from authenticated user).
- Treat branch metadata as dynamic data (not constants) to support branch growth safely.

## Operational Guidelines
- Use log levels consistently: INFO, SUCCESS, WARN, ERROR.
- Track key events: order received, routed, notified, accepted, retried, escalated, failed.
- Keep observability ready for production troubleshooting (timestamps, correlation/order IDs, source channel).

## Testing Strategy (Mandatory)
- Implement unit, integration, and end-to-end tests for notification-critical flows.
- Include high-concurrency test scenarios: multiple orders per second, single-branch spikes, and multi-branch simultaneous spikes.
- Include auth/branch tests: logged-in user/device must only receive/ring for assigned branch orders.
- Include retry/escalation tests: retry counts, delay windows, escalation trigger conditions, and stop-on-accept behavior.
- Include idempotency tests for duplicate order events and repeated notification triggers.

## Test Coverage Support
- Maintain coverage gates for core modules (ingestion, routing, notifications, auth, escalation).
- Every new feature/fix in critical flow must add or update test cases.
- Track branch-wise and channel-wise test scenarios as part of regression coverage.

## Folder Strategy
- Use feature-first modular structure: `src/modules/<feature>/` (auth, orders, routing, notifications, escalation, branches, users).
- Keep each module internally organized as: `controller/`, `service/`, `dto/`, `entity|model/`, `repository/`, `tests/`.
- Keep shared concerns in `src/common/` (guards, interceptors, utils, constants, logger, errors).
- Keep event and queue contracts in explicit folders (`events/`, `queues/`) to avoid hidden coupling.

## Naming Strategy
- Files: kebab-case (`order-routing.service.ts`, `notification-worker.spec.ts`).
- Classes/Types: PascalCase (`OrderRoutingService`, `CreateOrderDto`).
- Variables/functions: camelCase (`assignBranch`, `sendOrderAlert`).
- Constants/enums: UPPER_SNAKE_CASE for constants, PascalCase for enum names.
- Use consistent suffixes: `*.controller.ts`, `*.service.ts`, `*.repository.ts`, `*.dto.ts`, `*.spec.ts`.

## Dockerization Strategy (Engineering Rules)
- Use multi-stage Dockerfiles to keep runtime images small and secure.
- Never bake secrets into images; pass config only through environment variables/secrets.
- Pin base image majors (for example `node:22-alpine`) and refresh with controlled upgrades.
- Run containers as non-root user where possible.
- Keep `.dockerignore` strict to exclude `node_modules`, test artifacts, local env files, and VCS metadata.
- Healthcheck endpoints are required for backend and dashboard containers.
