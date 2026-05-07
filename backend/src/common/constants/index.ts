/**
 * Application-wide Constants
 */

export const APP_VERSION = '0.1.0';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

/**
 * HTTP Status Messages
 */
export const HTTP_MESSAGES = {
  OK: 'OK',
  CREATED: 'Created',
  BAD_REQUEST: 'Bad Request',
  UNAUTHORIZED: 'Unauthorized',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Not Found',
  CONFLICT: 'Conflict',
  INTERNAL_ERROR: 'Internal Server Error',
  SERVICE_UNAVAILABLE: 'Service Unavailable',
};

/**
 * Authentication Constants
 */
export const AUTH_CONSTANTS = {
  JWT_STRATEGY: 'jwt',
  JWT_PAYLOAD_KEY: 'user',
  LOCAL_STRATEGY: 'local',
  BEARER_SCHEME: 'Bearer',
  HEADER_AUTHORIZATION: 'Authorization',
};

/**
 * User Roles
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  BRANCH_MANAGER = 'branch_manager',
  OPERATOR = 'operator',
  VIEWER = 'viewer',
  API_USER = 'api_user',
}

/**
 * Branch-related Constants
 */
export const BRANCH_CONSTANTS = {
  DEFAULT_BRANCH_CODE: 'DEFAULT',
  ACTIVE_STATUS: 'active',
  INACTIVE_STATUS: 'inactive',
};

/**
 * Device Constants
 */
export enum DeviceType {
  MOBILE = 'mobile',
  WEB = 'web',
  KIOSK = 'kiosk',
  API = 'api',
}

export enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

/**
 * Order Status Constants
 */
export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  NORMALIZED = 'normalized',
  CONFIRMED = 'confirmed',
  READY = 'ready',
  DISPATCHED = 'dispatched',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

/**
 * Processing Status Constants
 */
export enum ProcessingStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

/**
 * Audit Action Constants
 */
export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  READ = 'read',
  LOGIN = 'login',
  LOGOUT = 'logout',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
}

/**
 * Error Codes
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

/**
 * Pagination Constants
 */
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_SORT: 'createdAt',
  DEFAULT_ORDER: 'DESC' as 'DESC' | 'ASC',
};

/**
 * Cache Constants
 */
export const CACHE_CONSTANTS = {
  TTL_1_HOUR: 3600,
  TTL_24_HOURS: 86400,
  TTL_7_DAYS: 604800,
  USER_CACHE_KEY: 'user:',
  BRANCH_CACHE_KEY: 'branch:',
  ROLE_CACHE_KEY: 'role:',
};

/**
 * Validation Constants
 */
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 100,
  MAX_EMAIL_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID_REGEX: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
};

/**
 * Time Constants (in milliseconds)
 */
export const TIME_CONSTANTS = {
  ONE_MINUTE: 60 * 1000,
  FIVE_MINUTES: 5 * 60 * 1000,
  TEN_MINUTES: 10 * 60 * 1000,
  ONE_HOUR: 60 * 60 * 1000,
  ONE_DAY: 24 * 60 * 60 * 1000,
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
};

/**
 * Source Connector Types
 */
export enum SourceType {
  WEBSITE = 'website',
  FOODPANDA = 'foodpanda',
  FOODI = 'foodi',
  PATHAO = 'pathao',
  CHILLI_POS = 'chilli_pos',
}

/**
 * Branch Status
 */
export enum BranchStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Raw Order Processing Status
 */
export enum RawOrderStatus {
  NEW = 'new',
  PENDING = 'pending',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  FAILED = 'failed',
  DUPLICATE = 'duplicate',
}

/**
 * Rate Limiting Constants
 */
export const RATE_LIMIT_CONSTANTS = {
  SUSTAINED_LIMIT: 100,
  SUSTAINED_WINDOW_MS: 60000,
  BURST_LIMIT: 10,
  BURST_WINDOW_MS: 1000,
  REDIS_KEY_PREFIX: 'rate-limit:',
};

/**
 * Idempotency Constants
 */
export const IDEMPOTENCY_CONSTANTS = {
  REDIS_KEY_PREFIX: 'idempotency:',
  TTL_SECONDS: 86400,
};

/**
 * Order Lifecycle Status (Week 4 state machine)
 */
export enum OrderLifecycleStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  ESCALATED = 'ESCALATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const ORDER_STATE_TRANSITIONS: Record<OrderLifecycleStatus, OrderLifecycleStatus[]> = {
  [OrderLifecycleStatus.PENDING]: [OrderLifecycleStatus.ACCEPTED, OrderLifecycleStatus.CANCELLED, OrderLifecycleStatus.ESCALATED],
  [OrderLifecycleStatus.ACCEPTED]: [OrderLifecycleStatus.PREPARING, OrderLifecycleStatus.CANCELLED, OrderLifecycleStatus.ESCALATED],
  [OrderLifecycleStatus.PREPARING]: [OrderLifecycleStatus.READY, OrderLifecycleStatus.CANCELLED, OrderLifecycleStatus.ESCALATED],
  [OrderLifecycleStatus.READY]: [OrderLifecycleStatus.COMPLETED, OrderLifecycleStatus.CANCELLED],
  [OrderLifecycleStatus.ESCALATED]: [OrderLifecycleStatus.ACCEPTED, OrderLifecycleStatus.CANCELLED],
  [OrderLifecycleStatus.COMPLETED]: [],
  [OrderLifecycleStatus.CANCELLED]: [],
};

/**
 * RabbitMQ Constants
 */
export const RABBITMQ_CONSTANTS = {
  EXCHANGE: 'tiffinbd.orders',
  NORMALIZATION_QUEUE: 'order-normalization',
  NORMALIZATION_ROUTING_KEY: 'order.normalize',
  DEAD_LETTER_EXCHANGE: 'tiffinbd.orders.dlx',
  DEAD_LETTER_QUEUE: 'order-normalization-dlq',
  DEAD_LETTER_ROUTING_KEY: 'order.normalize.failed',
  PREFETCH_COUNT: 10,
  MAX_RETRIES: 3,
};

/**
 * Feature Flags
 */
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ESCALATION: true,
  ENABLE_ANALYTICS: true,
  ENABLE_PRINTING: true,
  ENABLE_AUDIT_LOGGING: true,
  ENABLE_RATE_LIMITING: false, // Enable in Week 2
  ENABLE_CACHING: false, // Enable in Week 2
};
