# Mobile App Context

## Primary Purpose
Enable branch staff to receive, act on, and track incoming orders in real time, including when the app is backgrounded.

## Required Features
- Username/password login tied to user role and assigned branch.
- Real-time order alerts (Socket.IO + FCM).
- One-tap order acceptance/confirmation flow.
- Auto-print order details at the moment an order is accepted.
- Persistent alert behavior until accepted or escalated.
- Queue view for pending, active, and escalated orders.
- Recent-orders view (last few accepted/completed orders within branch access scope).
- Reprint option to print order details again for previously accepted orders.
- Branch-scoped access so users only see assigned branch orders.
- Live status synchronization after each action.
- Fast, minimal interaction design for peak-hour operations.

## Behavior Expectations
- Alerts should continue until a terminal action (accept/escalate) occurs.
- If a user/device misses a realtime event, push notification must still deliver awareness.
- App should gracefully recover state after reconnect/background return.
- App must handle rapid consecutive incoming orders (multiple per second) without UI freezes or missed alerts.
- Device should ring only for orders belonging to the logged-in user’s branch scope.
- Reprint must be available only for authorized users and only for orders visible in their branch scope.

## Dependencies
- Auth + branch/user mapping from backend.
- FCM token registration and lifecycle handling.
- Realtime channels keyed by branch/user roles.
