# Architectural Context

## Target Stack
- **Backend:** NestJS
- **Database:** MySQL
- **Realtime:** Socket.IO
- **Push:** Firebase Cloud Messaging (FCM)
- **Queue/Async:** BullMQ (Redis) or RabbitMQ
- **Dashboard:** Next.js
- **Mobile:** React Native
- **Deployment:** Dockerized services on VPS/Cloud

## High-Level Flow
1. Ingestion layer receives orders from website and third-party sources.
2. Normalization layer converts source-specific payloads to a unified order model.
3. Core backend stores orders, applies branch routing, and manages lifecycle state.
4. Notification layer emits realtime + push alerts and manages retry/escalation.
5. Dashboard and mobile clients subscribe to updates and perform order actions.

## Core Components
- Source connectors (website, Chilli POS workaround, third-party APIs/webhooks).
- Authentication and authorization service (username/password login, role + branch mapping).
- Order normalization service.
- Branch routing service.
- Order lifecycle/state service.
- Notification orchestrator (Socket.IO + FCM + queue workers).
- Escalation engine with timed retry policies.
- Admin/monitoring dashboard and branch-facing operational views.
- Concurrency-safe processing pipeline to support high order volume per second across one or many branches.
- Branch management module for dynamic onboarding/scaling of branches.

## Non-Functional Priorities
- End-to-end notification latency target aligned with <= 10s routing expectation.
- Fault tolerance for temporary network/service failures via queue-backed retries.
- Consistent branch isolation and role-based access.
- Structured logging and monitoring for operational reliability.
- Horizontal scalability and load handling for burst order traffic (single-branch spikes and multi-branch simultaneous spikes).
- Session/device correctness: orders notify only devices logged into the target branch.
- Container portability: same image behavior across local, staging, and production.
