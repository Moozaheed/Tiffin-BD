# Project Requirements Context

## Problem Statement
- Order alerts are currently unreliable (can stop early, can be missed, and may fail when POS tab is closed).
- Alerts are not persistent until acceptance.
- No robust escalation path for unattended orders.
- Multi-branch order handling is inefficient.

## Goals
- Ingest orders from website and third-party channels (Foodpanda/Foodi/Pathao where access exists).
- Normalize all orders into a unified internal format.
- Route orders to the correct branch within a target maximum delay of **10 seconds**.
- Deliver real-time alerts on web/mobile and keep alerting until accepted or escalated.
- Provide lifecycle visibility: Pending -> Accepted -> Escalated.
- Handle **high concurrency**: multiple orders per second, including bursts in one branch and simultaneous load across many branches.
- Bind each logged-in user/device to the correct branch using username/password authentication and branch assignment.
- Support easy onboarding of new branches without code changes.
- Support mobile access to recent order history for quick lookup and recovery workflows.
- Print order details automatically on order acceptance, with secure reprint support for lost/missed print copies.
- Enforce role-based dashboard access for multiple hierarchy levels (Super Admin, Admin, Business Head, Manager, Branch Manager, and branch staff roles as configured).

## Scope (In)
- Order ingestion + normalization.
- Branch-specific routing and multi-branch support.
- Real-time alerts and continuous alerting.
- Dashboard for monitoring and actioning orders.
- Mobile app for receiving and accepting orders.
- Mobile app recent-orders list (last few orders per branch/user scope).
- Mobile app reprint action for previously accepted orders.
- Retry and escalation workflow.
- Concurrent order processing and queueing to prevent dropped/blocked orders during traffic spikes.
- Authentication-based device-to-branch detection and routing.
- Dynamic branch expansion (add/update/deactivate branches from configuration/admin).
- Auto-print trigger when an order is accepted.
- Dashboard multi-role RBAC with role-specific permissions and visibility.
- Test-case-backed delivery with coverage for notification reliability and high-concurrency order processing.
- Container-first deployment strategy (Docker + Compose profiles for local, staging, production).

## Scope (Out / Constraints)
- No direct modification of Chilli POS SaaS.
- Deep third-party integration depends on available API/webhook access.
- Payment processing remains external.
- Advanced analytics are limited to operational insights in initial plan.
- Client is responsible for server procurement/configuration/maintenance costs.

## Required Inputs / Dependencies
- Website order flow/API access.
- Chilli POS integration access details (if workaround integration is permitted).
- Third-party API keys, webhook specs, and test environments.
- Branch/staff mapping and routing rules.
- Sample order data for testing.
- User credentials policy and role model (who can log in to which branch).
