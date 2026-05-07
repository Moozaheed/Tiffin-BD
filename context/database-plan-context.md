# Database Plan Context

## Goals
- Support high-throughput order ingestion.
- Preserve raw source data for audit/debug.
- Enforce branch-scoped access.
- Track connector delivery and normalization status.

## Core Entities (Initial)
1. **branches**
   - `id`, `code`, `name`, `status`, `timezone`, timestamps
2. **roles**
   - `id`, `name` (SUPER_ADMIN, ADMIN, BUSINESS_HEAD, MANAGER, BRANCH_MANAGER, STAFF), timestamps
3. **users**
   - `id`, `username`, `password_hash`, `display_name`, `status`, timestamps
4. **user_branch_roles**
   - `id`, `user_id`, `branch_id`, `role_id`, `is_primary`, timestamps
5. **devices**
   - `id`, `user_id`, `branch_id`, `platform`, `fcm_token`, `status`, `last_seen_at`, timestamps
6. **source_connectors**
   - `id`, `source_name`, `source_type` (WEBSITE, THIRDPARTY, CHILLI_BRIDGE), `config_json`, `status`, timestamps
7. **raw_orders**
   - `id`, `source_connector_id`, `source_order_id`, `idempotency_key`, `received_at`, `payload_json`, `status`, `error_message`
8. **normalized_orders**
   - `id`, `raw_order_id`, `canonical_order_no`, `branch_id`, `order_status`, `order_total`, `currency`, `customer_json`, `items_json`, `meta_json`, timestamps
9. **normalization_errors**
   - `id`, `raw_order_id`, `error_code`, `error_details`, `created_at`
10. **audit_logs**
   - `id`, `actor_user_id`, `event_type`, `entity_type`, `entity_id`, `branch_id`, `metadata_json`, `created_at`

## Key Constraints
- `raw_orders.idempotency_key` unique per source (`source_connector_id + idempotency_key`).
- `raw_orders.source_connector_id + source_order_id` unique (fallback dedupe).
- `user_branch_roles` unique (`user_id + branch_id + role_id`).
- Foreign keys on all branch/user/order relationships.

## Indexing Plan
- `raw_orders(received_at, status)`
- `raw_orders(source_connector_id, source_order_id)`
- `normalized_orders(branch_id, order_status, created_at)`
- `devices(branch_id, status)`
- `user_branch_roles(branch_id, role_id)`

## Data Lifecycle
- Keep `raw_orders` longer for traceability.
- Archive/partition old normalized orders by time window if needed.
- Keep audit logs immutable.

## Migration Strategy
- Versioned SQL migrations.
- Backward-compatible additive changes only in early releases.
- Seed baseline roles and a default super-admin bootstrap path.

