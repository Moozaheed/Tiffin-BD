# Dashboard Context

## Primary Purpose
Provide branch and admin users with realtime operational control over orders and staff response performance.

## Required Features
- Live order feed per branch via Socket.IO.
- Lifecycle status tracking: Pending -> Accepted -> Escalated.
- Branch-wise filtered monitoring views.
- Direct order actions (accept/manage) from the dashboard.
- User management (roles/access) and branch assignment.
- Role hierarchy support including Super Admin, Admin, Business Head, Manager, and Branch Manager (plus configurable additional roles).
- Branch management and branch-level configuration visibility.
- Operational analytics (e.g., average response time, user/branch performance trends).
- Admin capability to add and maintain new branches as operations grow.

## Behavior Expectations
- Order state changes must reflect immediately across dashboard and mobile clients.
- Branch users should only access data for permitted branches.
- Escalated/unattended orders must be visually prioritized.
- Dashboard feed must remain stable under high event throughput (many orders per second in single or multiple branches).
- Permission boundaries must be strictly enforced so each role only sees/actions what it is allowed to manage.

## Dependencies
- Realtime backend events and consistent order-state contracts.
- Role/permission model aligned with branch boundaries.
- Reliable audit logs to support monitoring and issue diagnosis.
