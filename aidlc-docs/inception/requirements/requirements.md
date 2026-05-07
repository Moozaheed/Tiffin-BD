# Week 1 Requirements Document

**Project**: TiffinBD - Order Management Platform  
**Phase**: Week 1 - Project Foundation & Backend Setup  
**Date**: 2026-04-29  
**Status**: ✅ APPROVED

---

## Executive Summary

Week 1 establishes the complete backend infrastructure and foundational systems for the TiffinBD order management platform. This greenfield project will implement a modular, production-grade NestJS backend with full Docker containerization, comprehensive database schema, and all essential infrastructure components.

**Scope**: Backend project initialization, database setup, Docker configuration, common modules, and health monitoring.

**Complexity**: **Moderate** - well-defined multi-component integration  
**Risk Level**: **Low** - clear requirements, established tech stack, proven patterns

---

## Intent Analysis

### Request Type
**New Project - Complete Backend Infrastructure Setup**

### Scope Classification
- **Scope Level**: Multiple components across ingestion, configuration, persistence, and containerization layers
- **System Boundary**: Backend NestJS application + MySQL database + Redis queue broker
- **Scale**: Foundation for 8-week delivery to production-ready platform

### Complexity Assessment
- **Technical Complexity**: Moderate - requires coordination of multiple systems (NestJS, TypeORM, Docker, environment config)
- **Business Logic Complexity**: Low - Week 1 focuses on infrastructure, not business logic
- **Uncertainty**: Low - requirements are well-documented in project context

---

## Functional Requirements

### FR1: Project Structure & Organization
- **FR1.1**: Create `/backend` folder at project root for monorepo-ready structure
- **FR1.2**: Implement modular folder structure following NestJS patterns:
  - `backend/src/modules/<feature>` for feature modules
  - `backend/src/common` for shared infrastructure
  - `backend/src/config` for configuration management
  - `backend/src/database` for migrations and seeds
  - `backend/src/tests` for test utilities
- **FR1.3**: Create comprehensive `.gitignore` for Node.js project
- **FR1.4**: Initialize `package.json` with all necessary dependencies and scripts

### FR2: Application Initialization
- **FR2.1**: Create NestJS application using `@nestjs/cli`
- **FR2.2**: Configure TypeScript with strict mode enabled
- **FR2.3**: Set up ESLint and Prettier for code quality
- **FR2.4**: Create AppModule as root module with feature module placeholders

### FR3: Feature Module Placeholders
Create placeholder modules for all future features to establish structure early:
- **FR3.1**: `AuthModule` - Authentication and JWT handling
- **FR3.2**: `UsersModule` - User management and profiles
- **FR3.3**: `BranchesModule` - Branch management and configuration
- **FR3.4**: `IngestionModule` - Order ingestion from multiple sources
- **FR3.5**: `NormalizationModule` - Order normalization and validation
- **FR3.6**: `OrdersModule` - Core order management
- **FR3.7**: `NotificationsModule` - Real-time and push notifications
- **FR3.8**: `EscalationModule` - Order escalation and retry logic
- **FR3.9**: `AnalyticsModule` - Operational analytics and reporting
- **FR3.10**: `PrintingModule` - Order printing system

### FR4: Common Infrastructure Module
- **FR4.1**: Implement custom exception classes:
  - `HttpException` (base exception)
  - `ValidationException` for input validation errors
  - `DatabaseException` for database errors
  - `AuthenticationException` for auth failures
  - `AuthorizationException` for permission failures
- **FR4.2**: Create guards for request protection:
  - `JwtGuard` for JWT-protected routes
  - `RolesGuard` for role-based access control
  - `BranchGuard` for branch-scoped access
- **FR4.3**: Create decorators for convenience:
  - `@Public()` - Mark endpoint as public
  - `@Roles()` - Specify required roles
  - `@CurrentUser()` - Inject authenticated user
  - `@Branch()` - Extract branch context from request
- **FR4.4**: Create request/response interceptors:
  - Logging interceptor with correlation IDs
  - Error handling interceptor
  - Serialization interceptor
- **FR4.5**: Implement structured logging with Bunyan:
  - Contextual logging with request IDs
  - Log levels: DEBUG, INFO, WARN, ERROR, FATAL
  - Console output for local dev, file output for production capability

### FR5: Environment Configuration
- **FR5.1**: Create `.env.example` with all required environment variables
- **FR5.2**: Implement configuration validation using class-validator:
  - Database connection parameters (host, port, username, password, database)
  - Redis connection parameters
  - JWT configuration (secret, expiration)
  - Application configuration (port, environment, log level)
- **FR5.3**: Create `ConfigModule` with:
  - Environment-based loading (.env.local, .env.staging, .env.production)
  - Validation on application startup (fail fast)
  - Error messages for missing required variables
  - Type-safe configuration interface

### FR6: Database Infrastructure
- **FR6.1**: Set up TypeORM with MySQL driver
- **FR6.2**: Create core database entities:
  - Branches entity (id, code, name, status, timezone, metadata)
  - Roles entity (id, name, permissions)
  - Users entity (id, username, password_hash, display_name, status)
  - UserBranchRoles entity (id, user_id, branch_id, role_id, is_primary)
  - Devices entity (id, user_id, branch_id, platform, fcm_token, status, last_seen_at)
  - SourceConnectors entity (id, source_name, source_type, config_json, status)
  - RawOrders entity (id, source_connector_id, source_order_id, idempotency_key, payload_json, status)
  - NormalizedOrders entity (id, raw_order_id, canonical_order_no, branch_id, order_status, total, currency)
  - NormalizationErrors entity (id, raw_order_id, error_code, error_details)
  - AuditLogs entity (id, actor_user_id, event_type, entity_type, entity_id, branch_id, metadata_json)
- **FR6.3**: Define all relationships, foreign keys, and constraints
- **FR6.4**: Create TypeORM repositories for all entities
- **FR6.5**: Configure connection pooling for production readiness

### FR7: Database Migrations
- **FR7.1**: Implement TypeORM migration system:
  - Migration CLI configured and working
  - Initial migration creating all core tables
  - Migration naming conventions documented
- **FR7.2**: Create seed migration with:
  - Default roles (SUPER_ADMIN, ADMIN, BUSINESS_HEAD, MANAGER, BRANCH_MANAGER, STAFF)
  - Bootstrap super-admin user for initial access
  - Test data for development (optional branches)

### FR8: Health Check Endpoint
- **FR8.1**: Implement `GET /health` endpoint returning:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-04-29T14:45:00Z",
    "uptime": 1234,
    "version": "1.0.0",
    "dependencies": {
      "database": {"status": "connected", "latency_ms": 5},
      "redis": {"status": "connected", "latency_ms": 2},
      "system": {"memory_usage_percent": 45, "cpu_usage_percent": 12}
    }
  }
  ```
- **FR8.2**: Implement health check service that validates:
  - Database connectivity with query timeout
  - Redis connectivity with PING command
  - System resource availability
  - Graceful degradation if non-critical services unavailable

### FR9: Logging Infrastructure
- **FR9.1**: Configure Bunyan logger with:
  - Structured JSON output
  - Request correlation ID tracking
  - Log levels configurable per environment
  - Console sink for local development
  - File sink capability for production
- **FR9.2**: Implement logging service with methods:
  - `debug()`, `info()`, `warn()`, `error()`, `fatal()`
  - Context injection (user ID, branch ID, request ID)
  - Automatic serialization of objects

---

## Non-Functional Requirements

### NFR1: Performance
- **NFR1.1**: Application startup time < 2 seconds
- **NFR1.2**: Health check endpoint response time < 100ms
- **NFR1.3**: Database connection pooling with min 2, max 10 connections
- **NFR1.4**: Redis connection with automatic reconnection

### NFR2: Reliability & Resilience
- **NFR2.1**: Application fails fast on critical configuration errors
- **NFR2.2**: Graceful handling of database unavailability in health check
- **NFR2.3**: Request timeout handling with correlation IDs for debugging
- **NFR2.4**: Automatic reconnection for transient database/Redis failures

### NFR3: Security (ENABLED - Security Baseline Extension)
- **NFR3.1**: All environment variables validated before application start
- **NFR3.2**: Secrets not logged or exposed in error messages
- **NFR3.3**: Database credentials only in environment variables, never in code
- **NFR3.4**: SQL injection prevention through parameterized queries (TypeORM)
- **NFR3.5**: CORS configuration prepared for future client integration
- **NFR3.6**: Non-root user for Docker container execution

### NFR4: Testing & Code Quality (ENABLED - Property-Based Testing Extension)
- **NFR4.1**: Jest configured for unit and integration testing
- **NFR4.2**: TypeScript strict mode enforced
- **NFR4.3**: ESLint rules configured for consistent code style
- **NFR4.4**: Configuration validation tested with multiple scenarios
- **NFR4.5**: Database entity relationships tested
- **NFR4.6**: Property-based tests for:
  - Configuration object transformations
  - Data serialization/deserialization round-trips
  - UUID generation and uniqueness
  - Timestamp handling and timezone conversions

### NFR5: Maintainability
- **NFR5.1**: Clear folder structure following established patterns
- **NFR5.2**: Comprehensive code comments for complex logic
- **NFR5.3**: README.md with setup and development instructions
- **NFR5.4**: Detailed .gitignore for Node.js project
- **NFR5.5**: Contributing guidelines documented

### NFR6: Observability
- **NFR6.1**: All application events logged with correlation IDs
- **NFR6.2**: Structured logging for machine-readable analysis
- **NFR6.3**: Request/response logging with sensitive data masking
- **NFR6.4**: Health check metrics for monitoring

### NFR7: Scalability Foundation
- **NFR7.1**: Stateless application design (no in-process state)
- **NFR7.2**: Connection pooling configured for horizontal scaling
- **NFR7.3**: Redis support for distributed caching (prepared for Week 5)
- **NFR7.4**: Module structure supports feature team parallelization

---

## Technical Decisions

### TD1: Technology Stack (Per Project Context)
- **Framework**: NestJS 10+ (TypeScript-first, modular, production-ready)
- **Language**: TypeScript with strict mode
- **Database**: MySQL 8.0+ with TypeORM ORM
- **Cache/Queue**: Redis with BullMQ (prepared in Week 5)
- **Logging**: Bunyan (structured logging, context tracking)
- **Testing**: Jest (unit, integration)
- **Containerization**: Docker with multi-stage builds

### TD2: Project Structure (Per Coding Guidelines)
```
/backend
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── branches/
│   │   ├── ingestion/
│   │   ├── normalization/
│   │   ├── orders/
│   │   ├── notifications/
│   │   ├── escalation/
│   │   ├── analytics/
│   │   └── printing/
│   ├── common/
│   │   ├── exceptions/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── logger/
│   │   ├── constants/
│   │   └── utils/
│   ├── config/
│   │   ├── configuration.ts
│   │   ├── database.config.ts
│   │   └── validation.schema.ts
│   ├── database/
│   │   ├── entities/
│   │   ├── repositories/
│   │   ├── migrations/
│   │   └── seeds/
│   └── tests/
├── docker/
│   └── Dockerfile
├── .dockerignore
├── docker-compose.yml
├── docker-compose.override.yml
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
├── .env.example
├── .gitignore
└── README.md
```

### TD3: Database Migrations Strategy
- TypeORM migrations for schema version control
- Seed migrations for initial data (roles, bootstrap user)
- Automatic migration execution on application startup (dev only)
- Manual review required for production migrations

### TD4: Configuration Management
- Single `.env` file per environment (dev, staging, prod)
- Environment variables validated against schema on startup
- Configuration objects typed with TypeScript interfaces
- No secrets stored in code or configuration files

### TD5: Docker Strategy (Local Development)
- `docker-compose.yml` for backend + MySQL + Redis services
- `docker-compose.override.yml` for local development overrides
- Volume mounts for code hot-reloading during development
- Health checks for all services
- Non-root user execution in containers

### TD6: Logging Approach
- Bunyan for structured, JSON-formatted logging
- Correlation IDs for request tracing across logs
- Context injection (user ID, branch ID, request ID)
- Console output for development, file output capability for production

---

## User Scenarios & Acceptance Criteria

### Scenario 1: Developer Onboarding
**Goal**: New developer can set up and run the project locally in < 5 minutes

**Steps**:
1. Clone repository
2. Navigate to `/backend` folder
3. Run `npm install`
4. Copy `.env.example` to `.env.local`
5. Run `docker-compose up`
6. Verify services running: `docker-compose ps`
7. Test health endpoint: `curl http://localhost:3000/health`

**Acceptance Criteria**:
- ✅ All dependencies install without errors
- ✅ Docker containers start successfully
- ✅ Health endpoint returns status 200 with all dependencies connected
- ✅ README.md provides clear step-by-step instructions

### Scenario 2: Environment Configuration Validation
**Goal**: Catch configuration errors early with clear error messages

**Given**: Developer starts application with missing required `.env` variables  
**When**: Application initializes  
**Then**: Application fails with clear error message listing missing variables

**Acceptance Criteria**:
- ✅ Error message displays which variables are missing
- ✅ Error message suggests correct format/values
- ✅ Application exits cleanly without partial startup
- ✅ Error is logged to console and logs

### Scenario 3: Health Check Verification
**Goal**: Monitoring system can verify application and dependencies are healthy

**Given**: All services are running  
**When**: Health check endpoint is called  
**Then**: Returns comprehensive status of all dependencies

**Acceptance Criteria**:
- ✅ Endpoint returns HTTP 200 status
- ✅ Response includes database connectivity status
- ✅ Response includes Redis connectivity status
- ✅ Response includes system resource metrics
- ✅ All dependency checks complete in < 100ms

### Scenario 4: Database Schema Ready
**Goal**: Database is ready for future feature implementation

**Given**: Application is started  
**When**: Database migrations run  
**Then**: All core entities are created with proper relationships

**Acceptance Criteria**:
- ✅ All 10 core entities exist in database
- ✅ Foreign keys and relationships are established
- ✅ Indexes are created on query performance columns
- ✅ Default roles and bootstrap admin user exist
- ✅ Migration can be run/rollback reliably

### Scenario 5: Logging Context Tracking
**Goal**: Support troubleshooting with correlated logs

**Given**: Application is processing requests  
**When**: Requests are logged  
**Then**: Logs include correlation IDs for request tracing

**Acceptance Criteria**:
- ✅ Each request gets unique correlation ID
- ✅ Correlation ID appears in all logs for that request
- ✅ Logs are structured JSON format
- ✅ Sensitive data (passwords, tokens) not logged

---

## Constraints & Dependencies

### Constraints
- **Timeline**: Week 1 only (single week sprint)
- **Team Size**: Single developer or small team
- **Local Development**: Docker must run on developer machine
- **Database**: Must use MySQL 8.0+
- **Runtime**: Node.js 22+

### Dependencies
- **External**: Docker Desktop, npm/yarn
- **Project**: Full context documents and coding guidelines already available
- **Future Integration**: Database schema must support all 8-week feature requirements

---

## Success Criteria

✅ **Week 1 Completion Metrics**:

1. **Infrastructure**:
   - [ ] `/backend` folder structure created and organized
   - [ ] NestJS application initialized and running
   - [ ] TypeScript, ESLint, Prettier configured
   - [ ] Package.json with all dependencies

2. **Database**:
   - [ ] MySQL container running and accessible
   - [ ] All 10 core entities defined in TypeORM
   - [ ] Migrations working (create and seed)
   - [ ] Repositories implemented for all entities

3. **Docker**:
   - [ ] Docker Compose with backend, MySQL, Redis services
   - [ ] docker-compose.yml and override files working
   - [ ] Health checks on all containers
   - [ ] Volumes configured for persistence and hot-reload

4. **Common Infrastructure**:
   - [ ] Exception classes implemented
   - [ ] Guards created (JWT, Roles, Branch)
   - [ ] Decorators created (@Public, @Roles, @CurrentUser, @Branch)
   - [ ] Interceptors for logging and error handling
   - [ ] Bunyan logger configured

5. **Configuration**:
   - [ ] Environment variables validated with class-validator
   - [ ] `.env.example` template created
   - [ ] Configuration module type-safe
   - [ ] Startup validation working

6. **Health & Monitoring**:
   - [ ] GET /health endpoint implemented
   - [ ] All service dependencies checked
   - [ ] Response includes latency metrics
   - [ ] Endpoint response < 100ms

7. **Feature Modules**:
   - [ ] 10 placeholder modules created (Auth, Users, Branches, etc.)
   - [ ] Modules imported in AppModule
   - [ ] Module structure follows NestJS patterns
   - [ ] Ready for Week 2 onward implementation

8. **Testing & Quality**:
   - [ ] Jest configuration ready
   - [ ] TypeScript strict mode enabled
   - [ ] ESLint rules applied
   - [ ] README.md with setup instructions

9. **Security** (Extension Enabled):
   - [ ] Environment secrets not in code
   - [ ] SQL injection prevention (parameterized queries)
   - [ ] CORS prepared for client integration
   - [ ] Security checklist reviewed

10. **Property-Based Testing** (Extension Enabled):
    - [ ] Configuration validation property tests
    - [ ] UUID generation tests
    - [ ] Serialization/deserialization round-trip tests
    - [ ] Entity relationship tests

---

## Deliverables

### Code
- ✅ Complete `/backend` NestJS application
- ✅ All entities, repositories, migrations
- ✅ Common modules and infrastructure
- ✅ Docker configuration files
- ✅ Environment configuration system

### Documentation
- ✅ README.md with setup instructions
- ✅ Contributing guidelines
- ✅ Database schema documentation
- ✅ API endpoint structure (prepared for Week 2)
- ✅ Architecture overview

### Infrastructure
- ✅ docker-compose.yml working locally
- ✅ Database backup/restore procedures
- ✅ Health monitoring setup
- ✅ Logging infrastructure ready

---

## Approval & Next Steps

**Status**: ✅ APPROVED by User  
**Approval Date**: 2026-04-29  
**Approved by**: AI-DLC Requirements Analysis  
**Extension Configuration**: 
- ✅ Security Baseline: ENABLED
- ✅ Property-Based Testing: ENABLED

**Next Phase**: ⏭️ INCEPTION - Workflow Planning  

All requirements are documented, approved, and ready for **CONSTRUCTION PHASE** implementation.

---

