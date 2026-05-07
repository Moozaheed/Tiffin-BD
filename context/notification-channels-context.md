# Notification Channels Context

## Channels in Scope
- **Realtime WebSocket (Socket.IO):** immediate in-app/dashboard delivery.
- **Push Notifications (FCM):** delivery when app is backgrounded/closed.
- (Optional future) Additional escalation channels if business rules require.

## Notification Objectives
- Trigger new-order alerts immediately after branch routing.
- Keep alerts persistent until acceptance or escalation.
- Ensure cross-device consistency for branch staff.
- Prevent silent failures through retries and escalation.
- Support concurrent notification fan-out for high order rates (multiple orders per second, single-branch bursts, and cross-branch bursts).
- Deliver alerts only to devices authenticated into the target branch (via user login context).

## Retry and Escalation Policy (from planning docs)
1. Send alert to kitchen/branch devices.
2. Wait 10-30 seconds.
3. Retry up to 2-3 times.
4. Escalate to manager/supervisor.
5. Optional auto-assignment path.

## Delivery and Reliability Requirements
- Queue-backed delivery orchestration (BullMQ/Redis or RabbitMQ).
- Explicit ack/status tracking: sent, delivered, viewed (if available), accepted.
- Dedupe and idempotency safeguards for repeated events.
- Logging at each stage for troubleshooting and SLA tracking.
- Per-branch and global worker scaling strategy so no order notification is delayed or dropped during peaks.
- Dynamic topic/channel management so newly added branches start receiving correct notifications without redeploy complexity.

## Notification Testing Coverage
- Concurrency load tests for multiple orders per second across one and multiple branches.
- Branch-scope tests to verify only authenticated branch devices receive ringing alerts.
- Retry/escalation timing tests (10-30s window and max retry rules).
- Delivery-failure and recovery tests (offline device, reconnect, duplicate events).
