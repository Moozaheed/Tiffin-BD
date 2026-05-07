# TiffinBD Project Instructions

This file contains project-specific instructions, architecture, and workflows for the TiffinBD project. It supplements the global Gemini CLI mandates and MUST be followed for all tasks in this workspace.

## Project Identity & Context
- **Project Name**: TiffinBD (Real-Time Order Notification & Alert System)
- **Goal**: A multi-branch order management platform with real-time notifications and an 8-week delivery plan.
- **Current Phase**: Week 1 - CONSTRUCTION PHASE (Unit 1: Backend Infrastructure & Setup)
- **Framework**: NestJS (TypeScript), Next.js (Dashboard), React Native (Mobile)
- **Stack**: MySQL (TypeORM), Redis (BullMQ), Docker, Socket.IO, Firebase Cloud Messaging (FCM).

## Workflow Mandate: AI-DLC
This project follows the **AI-Driven Development Life Cycle (AI-DLC)**.
- **Rule Source**: `.aidlc/aws-aidlc-rules/core-workflow.md` and `.aidlc/aws-aidlc-rule-details/`.
- **State Tracking**: Update `aidlc-docs/aidlc-state.md` at every stage transition.
- **Audit Logging**: EVERY interaction MUST be logged in `aidlc-docs/audit.md`. Capture complete raw user input, timestamps (ISO 8601), and AI responses.
- **Adaptive Execution**: Only execute stages that add value, but always confirm with the user.
- **Checkbox Enforcement**: Detailed plan checkboxes MUST be updated in the same turn the work is completed.

## Architecture & Coding Standards
- **Modular NestJS**: Follow the directory structure defined in `Documents/PROJECT_PLAN_SUMMARY.md`.
- **Database**: Use TypeORM with MySQL. All schema changes MUST use migrations (`backend/src/database/migrations`).
- **Logging**: Use Bunyan for structured, contextual logging with correlation IDs.
- **NFRs**:
  - **Performance**: Startup < 2s, Health check < 100ms.
  - **Security**: Secrets in `.env` only; no hardcoded credentials; non-root Docker users.
  - **Testing**: Jest for unit/integration tests; property-based testing enabled.
- **Docker**: All services (backend, db, redis) must be containerized with `docker-compose`.

## Operational Rules
- **Search First**: Use `grep_search` to find existing patterns before proposing changes.
- **Content Validation**: Validate all Mermaid and ASCII diagrams before writing files.
- **Health Checks**: Every backend component MUST expose a `/health` endpoint validating its dependencies.
- **No Reverts**: Do not revert changes unless explicitly asked or if they cause breaking errors.
- **Specialized Agent Skill**: Use the `tiffinbd-architect` skill for all AI-DLC orchestration and TiffinBD implementation tasks. Activate it using `activate_skill('tiffinbd-architect')` at the start of complex tasks.

## Next Steps (Week 1 Construction)
1. **Functional Design**: Finalize folder hierarchy and module layout.
2. **NFR Design**: Performance, security, and testing specifications.
3. **Infrastructure Design**: Docker, database, and logging setup.
4. **Code Generation**: Create the 50+ foundational files for the backend.
5. **Build & Test**: Verify the local stack is running and healthy.

---
*Created on 2026-04-29 based on project documentation and AIDLC requirements.*
