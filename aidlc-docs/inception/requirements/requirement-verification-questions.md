# Week 1 Requirement Verification Questions

## Project Context
Your request is to complete Week 1 of the TiffinBD platform, focusing on:
- NestJS backend project initialization
- Database setup with TypeORM and MySQL
- Docker and docker-compose configuration
- Common infrastructure modules
- Health check endpoint
- Environment configuration

The project has comprehensive context documents defining a complete 8-week roadmap for an order management platform. This Week 1 focuses on project foundation and infrastructure.

---

## Question 1: Project Folder Structure

Where should the application code be created?

**Options**:
A) Create application code directly in the workspace root (`/home/bs01233/Documents/TiffinBD/src`, `/home/bs01233/Documents/TiffinBD/package.json`, etc.)
B) Create a separate `backend` folder (`/home/bs01233/Documents/TiffinBD/backend/src`, `/home/bs01233/Documents/TiffinBD/backend/package.json`, etc.) to prepare for future monorepo with dashboard and mobile apps
C) Create a `week-1` folder for Week 1 work specifically, then merge structure later
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 2: Database Configuration

What should be the primary database setup approach?

**Options**:
A) Use local MySQL container with docker-compose (dev environment focused)
B) Support multi-environment: local container + staging/production configuration templates
C) Cloud-ready: MySQL configuration optimized for AWS RDS or similar managed services
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 3: Redis/Queue Configuration

For the notification and async processing queue (BullMQ), how should Redis be configured?

**Options**:
A) Include Redis container in docker-compose for local development
B) Make Redis optional for Week 1 (basic setup without queues, add in Week 5)
C) Use in-memory queue adapter for now, switch to Redis later
D) All of the above - provide flexible configuration
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 4: NestJS Modules & Structure

Should the NestJS application initialize with:

**Options**:
A) Minimal modules (only AppModule, no feature modules in Week 1)
B) Core infrastructure only: AppModule, HealthModule, ConfigModule, shared CommonModule
C) Placeholder modules for all future features (Auth, Users, Branches, Orders, Notifications, etc.) as stubs
D) Complete modular structure with all modules scaffolded (even if empty implementations)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 5: Configuration Management

How should environment variables and configuration be handled?

**Options**:
A) Use `.env` file with class-validator schema for validation
B) Create separate config files for each environment (local.config, staging.config, production.config)
C) Environment variable + dotenv-safe for strict validation
D) All of the above - comprehensive configuration framework
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 6: Logging Setup

What logging framework should be used?

**Options**:
A) NestJS built-in Logger
B) Winston (with file rotation, structured logging)
C) Pino (high-performance, structured logging)
D) Bunyan (structured logging with context tracking)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 7: Database Migrations

How should database migrations be handled?

**Options**:
A) TypeORM CLI with synchronization (auto-update schema from entities)
B) TypeORM migrations framework (explicit migration files) with seed data
C) SQL migration scripts managed separately
D) Both TypeORM migrations AND seed scripts for complete reproducibility
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 8: Security Baseline Extension

Should security extension rules be enforced for this project?

A) **Yes** — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)
B) **No** — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 9: Property-Based Testing Extension

Should property-based testing (PBT) rules be enforced for this project?

A) **Yes** — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)
B) **Partial** — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)
C) **No** — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 10: Docker Compose Configuration

What deployment profiles should docker-compose support?

**Options**:
A) Local development only (docker-compose.yml with override)
B) Local + staging (docker-compose.yml, docker-compose.staging.yml)
C) Local + staging + production (three separate compose files)
D) All profiles with override pattern for flexibility (base + override)
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 11: Testing Infrastructure

For Week 1, how should testing be set up?

**Options**:
A) Jest configured but tests not required for Week 1
B) Jest + comprehensive test suite with >80% coverage expectation
C) Jest configured for future use, basic setup only
D) Include sample unit and integration tests to establish patterns
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Question 12: Folder Structure Naming

What naming convention should be used for the application code?

**Options**:
A) Follow context/coding-guidelines: `src/modules/<feature>/`, `src/common/`, etc.
B) Simplified structure to start, evolve into full structure by Week 4
C) Flat structure initially, refactor as features are added
X) Other (please describe after [Answer]: tag below)

[Answer]: 

---

## Instructions for Answering

1. **Please fill in all [Answer]: fields** with your chosen option letter (A, B, C, D, or X)
2. **If you select "X) Other"**, please provide a brief description of your preference
3. **Return the completed file** with all answers filled in
4. **I will then analyze** your answers for any ambiguities and ask follow-up questions if needed
5. **Once all questions are resolved**, we'll generate the complete requirements document and proceed to workflow planning

---

## How to Respond

Please update the [Answer]: fields in this document and let me know when complete. You can also:
- **Suggest defaults** (I'll apply my recommendations if you're uncertain)
- **Ask for clarification** on any question
- **Indicate priority concerns** if some aspects matter more than others

I'm ready to generate the complete project setup following your preferences!

