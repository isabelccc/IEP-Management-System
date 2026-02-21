# Backend Design - IEP Management System

## 1) Purpose

This document defines a detailed backend design for the IEP Management System prototype.  
The backend should provide secure APIs, enforce workflow rules, and store IEP data in PostgreSQL with clear traceability.

## 2) Backend Stack

- Runtime: Node.js
- Framework: `Express`
- Database: `PostgreSQL` (`pg` driver)
- Configuration: `dotenv`
- API format: REST + JSON

## 3) High-Level Architecture

- API Layer (routes/controllers)
  - Request validation
  - Auth/authorization checks
  - Response shaping and error mapping
- Service Layer
  - Business logic for IEP lifecycle and AI flows
  - Status transition rules
  - Compliance-related calculations
- Data Access Layer (repositories/queries)
  - SQL operations grouped by domain
  - Transaction boundaries for multi-step writes
- Database Layer
  - Normalized schema for students, IEPs, goals, and progress

## 4) Project Structure (Recommended)

```text
backend/
  src/
    app.js
    server.js
    config/
      database.js
      env.js
    middleware/
      auth.middleware.js
      role.middleware.js
      validate.middleware.js
      error.middleware.js
    routes/
      auth.routes.js
      students.routes.js
      ieps.routes.js
      goals.routes.js
      progress.routes.js
      accommodations.routes.js
      assessments.routes.js
      observations.routes.js
      ai.routes.js
    controllers/
    services/
    repositories/
    validators/
    utils/
    db/
      migrations/
      seeds/
```

## 5) Data Model Design

### MVP tables (build first)
- `users`
- `students`
- `ieps`
- `iep_present_levels`
- `iep_goals`
- `goal_progress_updates`
- `accommodations`
- `iep_accommodations`
- `assessments`
- `teacher_observations`

### Key relationships
- `students` 1:N `ieps`
- `ieps` 1:N `iep_goals`
- `iep_goals` 1:N `goal_progress_updates`
- `ieps` N:M `accommodations` through `iep_accommodations`
- `students` 1:N `assessments`
- `students` 1:N `teacher_observations`

### Indexing guidance
- Add indexes on common filters:
  - `ieps(student_id, status)`
  - `iep_goals(iep_id, status)`
  - `goal_progress_updates(iep_goal_id, progress_date)`
  - `assessments(student_id, assessment_date)`
  - `teacher_observations(student_id, observation_date)`

## 6) API Design

### Auth endpoints
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Student endpoints
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/students`
- `PATCH /api/students/:id`

### IEP endpoints
- `GET /api/ieps?studentId=`
- `GET /api/ieps/:id`
- `POST /api/ieps`
- `PATCH /api/ieps/:id`
- `POST /api/ieps/:id/status` (draft -> review -> finalized)

### Present levels + goals
- `PUT /api/ieps/:id/present-levels`
- `GET /api/ieps/:id/goals`
- `POST /api/ieps/:id/goals`
- `PATCH /api/goals/:goalId`

### Progress endpoints
- `GET /api/goals/:goalId/progress`
- `POST /api/goals/:goalId/progress`

### Assessment/observation endpoints
- `POST /api/students/:id/assessments`
- `GET /api/students/:id/assessments`
- `POST /api/students/:id/observations`
- `GET /api/students/:id/observations`

### Accommodation endpoints
- `GET /api/accommodations`
- `POST /api/ieps/:id/accommodations`
- `DELETE /api/ieps/:id/accommodations/:accommodationId`

### AI endpoints
- `POST /api/ai/present-levels/generate`
- `POST /api/ai/goals/generate`
- `POST /api/ai/goals/analyze`
- `POST /api/ai/accommodations/suggest`

## 7) Request/Response Rules

- All endpoints return JSON with consistent shape:
  - success: `{ "data": ... }`
  - error: `{ "error": { "code": "...", "message": "..." } }`
- Use appropriate HTTP status codes:
  - `200/201` success
  - `400` validation error
  - `401` unauthenticated
  - `403` unauthorized
  - `404` not found
  - `409` conflict
  - `500` internal error

## 8) Business Logic Rules

### IEP status transitions
- Allowed: `draft -> review -> finalized`
- Optional rollback: `review -> draft` (admin only)
- Finalization requires:
  - present levels exists
  - at least one active measurable goal
  - required plan dates present

### Goal progress rules
- Progress entry date cannot be in invalid format
- Goal must belong to an active IEP
- Discontinued goals may be read-only for new progress (policy-based)

### Accommodation rules
- Avoid duplicate accommodation assignment per IEP
- Keep catalog active/inactive to avoid hard deletes

## 9) AI Service Design

### AI service abstraction
- `AIService.generatePresentLevels(input)`
- `AIService.generateGoal(input)`
- `AIService.analyzeGoalQuality(input)`
- `AIService.suggestAccommodations(input)`

### AI processing flow
1. Validate user role and payload
2. Fetch relevant student context (assessments, observations, goals)
3. Build prompt payload for model provider
4. Store result in `ai_generation_logs` (phase 2 table)
5. Return editable draft text or suggestion objects

### AI guardrails
- Never auto-write final IEP fields without explicit user action
- Include disclaimer metadata in response (`draftGenerated: true`)
- Redact sensitive attributes not required for generation

## 10) Security Design

- Authentication:
  - Session cookie (preferred) or JWT with short lifetime
- Authorization:
  - Role-based checks (`teacher`, `admin`)
  - Resource ownership checks (teacher caseload restriction)
- Input protection:
  - Validate all request bodies and query params
  - Parameterized SQL only (no string concatenation)
- Data protection:
  - Password hashing with strong algorithm (bcrypt/argon2)
  - Audit logging for critical actions (phase 2)

## 11) Transaction and Consistency Strategy

Use transactions for multi-table operations:
- Create IEP + initial present levels
- Finalize IEP + lock status + completion timestamp
- Bulk accommodation assignment

Rollback transaction on any validation or query failure.

## 12) Error Handling and Observability

- Central error middleware for consistent error responses
- Structured logs with request id and user id
- Log categories:
  - auth events
  - data mutation events
  - AI generation events
  - system/database errors
- Add health endpoint: `GET /api/health`

## 13) Performance and Scalability

- Pagination for list endpoints (`page`, `limit`)
- Filter/sort support for students and IEPs
- Query only needed columns for list views
- Add indexes based on real query usage
- Introduce caching later for read-heavy dashboard metrics

## 14) Backend MVP Milestones

1. Initialize PostgreSQL schema for MVP tables
2. Implement auth + role middleware
3. Build student and IEP CRUD endpoints
4. Build goals and progress endpoints
5. Build assessment/observation endpoints
6. Add two AI endpoints (present levels + goal generation)
7. Add validation + centralized error handling

## 15) Phase 2 Backend Enhancements

- Add `schools` for multi-tenant/multi-school support
- Add `services`, `documents`, `compliance_tasks`
- Add `audit_logs` and `ai_generation_logs`
- Add reporting endpoints
- Add automated tests (unit + integration + API contract)
