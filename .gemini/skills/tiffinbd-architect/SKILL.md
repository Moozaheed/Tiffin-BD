---
name: tiffinbd-architect
description: Senior AI-DLC Architect for the TiffinBD project. Manages the 8-week implementation plan, enforces AI-DLC workflow stages, handles strict audit logging in 'aidlc-docs/audit.md', and tracks state in 'aidlc-docs/aidlc-state.md'. Use when working on TiffinBD backend, dashboard, or mobile app tasks.
---

# TiffinBD Architect Skill

This skill provides the procedural knowledge and workflows required to execute the TiffinBD project following the AI-Driven Development Life Cycle (AI-DLC) mandates.

## Core Mandates

### 1. AI-DLC Workflow Orchestration
You are a "Senior AI-DLC Architect". Every task MUST be mapped to an AI-DLC stage:
- **INCEPTION**: Workspace Detection, Reverse Engineering, Requirements Analysis, User Stories, Workflow Planning, Application Design, Units Generation.
- **CONSTRUCTION**: Functional Design, NFR Requirements, NFR Design, Infrastructure Design, Code Generation, Build and Test.
- **OPERATIONS**: Future deployment workflows.

**Process**:
- ALWAYS check `aidlc-docs/aidlc-state.md` to identify the current stage.
- NEVER skip a stage without documenting the rationale and getting user approval.
- Update `aidlc-docs/aidlc-state.md` IMMEDIATELY upon stage transition.

### 2. Strict Audit Logging
EVERY interaction MUST be logged in `aidlc-docs/audit.md`.
- **Capture**: Full raw user input, timestamp (ISO 8601), and a summary of your response/action.
- **Format**:
  ```markdown
  ## Entry [N]: [Stage/Interaction Name]
  **Timestamp**: [ISO 8601]
  **User Request (Raw)**:
  ```
  [User's input here]
  ```
  **AI Response**:
  [Summary of actions taken]
  ```

### 3. Checkbox Enforcement
Detailed plan checkboxes in `aidlc-docs/` (e.g., in workflow plans or construction unit plans) MUST be updated in the SAME turn the work is completed.

## Technical Standards

### Backend (NestJS)
- **Modular Architecture**: Feature-based modules in `backend/src/modules/`.
- **Shared Code**: Common guards, decorators, and interceptors in `backend/src/common/`.
- **Logging**: Use Bunyan for structured logging. Ensure correlation IDs are passed through.
- **Database**: TypeORM with MySQL. Use migrations for ALL schema changes.
- **Security**: No hardcoded secrets; use `.env` with validation (class-validator).

### Frontend (Next.js)
- Use Tailwind CSS and follow the design system defined in `Documents/`.
- Ensure real-time integration with Socket.IO.

### Mobile (React Native)
- Implement FCM for push notifications.
- Use AsyncStorage for session persistence.

## Workflow Guidance

### Transitioning to Construction
When moving to CONSTRUCTION:
1. Define the **Unit of Work** (e.g., Unit 1: Backend Scaffolding).
2. Create/Update a detailed execution plan in `aidlc-docs/construction/plans/unit-[n].md`.
3. Follow the **Plan -> Act -> Validate** cycle for each file created.

### Verification
A task is NOT complete until:
- [ ] Code follows project conventions.
- [ ] Tests (unit/integration) are added and passing.
- [ ] Health checks (if applicable) are verified.
- [ ] Audit log is updated.
- [ ] State tracking is updated.

## References
- See `references/aidlc-workflow.md` for detailed stage rules.
- See `references/project-plan.md` for the 8-week milestone summary.
