# AI-DLC Workflow Stages Detail

## INCEPTION PHASE
Determine WHAT to build and WHY.

1. **Workspace Detection**: Detect project type (Greenfield/Brownfield) and root.
2. **Reverse Engineering**: (Brownfield only) Map existing code.
3. **Requirements Analysis**: Finalize functional and NFR requirements.
4. **User Stories**: Define personas and acceptance criteria.
5. **Workflow Planning**: Plan the implementation sequence and units.
6. **Application Design**: (Optional) High-level component design.
7. **Units Generation**: Break down the project into discrete Units of Work.

## CONSTRUCTION PHASE
Determine HOW to build it and execute.

Repeat for each Unit:
1. **Functional Design**: Detailed logic and data models.
2. **NFR Requirements**: Specific performance/security/testing needs.
3. **NFR Design**: Patterns to meet NFRs.
4. **Infrastructure Design**: Docker/DB/Environment setup.
5. **Code Generation**: Implementation of code and tests.

Finally:
- **Build and Test**: End-to-end verification of all units.

## OPERATIONS PHASE
Deploy and monitor.

- **Operations**: Deployment planning, monitoring setup, and launch.
