# Third-Party Integration Plan Context

## Integration Model
Use a connector adapter pattern:
- Common ingestion contract for all sources.
- Source-specific adapters handle authentication, signature validation, and mapping.
- Normalization service converts adapter output into canonical order schema.

## Source Types
1. **Website Orders**
   - Direct API/webhook into ingestion endpoint.
2. **Third-Party Platforms** (Foodpanda/Foodi/Pathao etc.)
   - Preferred: webhook push.
   - Alternative: scheduled polling bridge if webhook unavailable.
3. **Chilli POS Workaround**
   - Bridge endpoint or polling/sync adapter (depending on permitted access).

## Connector Pipeline
1. Receive event/payload.
2. Verify source auth/signature/token.
3. Generate idempotency key and dedupe.
4. Store raw payload (`raw_orders`).
5. Transform into source-neutral intermediate contract.
6. Normalize into canonical order.
7. Emit event for downstream routing/notifications.

## Adapter Contract (Per Source)
- `validateRequest()`
- `extractSourceOrderId()`
- `buildIdempotencyKey()`
- `toIntermediateOrder()`
- `mapStatus()`
- `mapPayment()`

## Error Handling Strategy
- Reject invalid signatures with explicit error.
- Mark malformed payloads as `normalization_error`.
- Retry transient connector failures (network/timeout).
- Keep dead-letter queue path for repeatedly failing events.

## Security Strategy
- IP allowlist where supported.
- HMAC signature verification where supported.
- Source credentials stored in env/secret manager.
- Full audit trail for received and rejected events.

## Testing Strategy (Integration-Focused)
- Mock webhook payload tests per source.
- Duplicate event/idempotency tests.
- Rate/burst tests with mixed source traffic.
- Partial failure tests (one source degraded, others healthy).

## Data Needed From Client Before Build
- API docs/webhook docs for each source.
- Credential issuance process and sandbox access.
- Example payloads (new order, update, cancel).
- Retry expectations and SLA per partner.
- Chilli POS accessible integration path (if any).

