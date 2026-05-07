# Implementation Planning Context

## Objective
Deliver Phase-1 foundation for:
1. Source Connectors
2. Authentication & Authorization (role + branch mapping)
3. Order Normalization

This phase prepares stable input for branch routing, notifications, and printing flows.

## Planned Architecture Slice
1. **Ingestion Layer**
   - Receives orders from website and third parties (webhooks/API polling bridge where needed).
   - Stores raw payloads and source metadata.
2. **Auth/RBAC Layer**
   - Username/password login.
   - Role-based permissions and branch-scoped access.
   - Device/session tied to logged-in branch scope.
3. **Normalization Layer**
   - Converts source-specific payloads into one canonical order format.
   - Validates required fields and classifies errors.

## Module Plan (NestJS)
- `src/modules/auth/`
- `src/modules/users/`
- `src/modules/branches/`
- `src/modules/ingestion/`
- `src/modules/normalization/`
- `src/common/` (guards, decorators, logger, exceptions, constants)

## Execution Phases
1. **Foundation**
   - Module scaffolding, env validation, shared contracts.
2. **Auth/RBAC**
   - Login, token/session, role-permission checks, branch-scoped guards.
3. **Connectors**
   - Website connector, generic third-party adapter, Chilli POS workaround adapter boundary.
4. **Normalization**
   - Source mapping -> canonical order model, validation and failure handling.
5. **Testing + Hardening**
   - Unit + integration + e2e + concurrency test pack.

## API Surface (Initial)
- `POST /auth/login`
- `POST /ingestion/website/orders`
- `POST /ingestion/third-party/:source/webhook`
- `POST /ingestion/chilli-bridge/orders` (workaround entry point)
- `POST /normalization/preview` (internal/admin validation endpoint)

## Non-Functional Rules
- Idempotent ingestion (duplicate-safe).
- Concurrency-safe processing for multi-order bursts.
- Branch isolation by auth context.
- Structured logs with correlation IDs.

## Acceptance Criteria for This Phase
- Orders can be ingested from at least one website source + one third-party format.
- Login enforces role + branch scope correctly.
- Normalized order output is consistent across sources.
- Test suite covers core success/failure and high-load scenarios.

