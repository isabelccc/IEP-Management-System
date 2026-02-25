# Backend Design — IEP Management System

## 1. Purpose

This document defines the backend design for the IEP Management System: APIs, data model, and planned work. Completed items are summarized; new plans include file names and endpoints (including the AI assistant).

## 2. Stack

- **Runtime:** Node.js  
- **Framework:** Express  
- **Database:** PostgreSQL (`pg` driver)  
- **Config:** `dotenv`  
- **Auth:** JWT, bcrypt  

## 3. Current Structure (Implemented)

```text
backend/
  service.js                 # App entry, route mounting
  config/
    database.js              # pg Pool, DB connection
  controllers/
    auth.js                  # login, logout, getMe
    students.js              # CRUD, resolveSchoolId
    iep.js                   # getAllIeps, getByiepId, addIepRecord, updateIepById, addIepStatus
                             # resolveStudentId, resolveCaseManagerUserId
    school.js                # getAllSchools
  routes/
    auth.routes.js           # POST /login, POST /logout, GET /me
    student.routes.js        # GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
    iep.routes.js            # GET /, GET /:id, POST /, PATCH /:id, POST /:id/status
    school.routes.js         # GET /
  db/
    initDB.js                # Schema: schools, students, users, ieps, iep_present_levels, etc.
  script/
    seed.js                  # seed schools, users, students, ieps
```

## 4. Current API (Implemented)

| Area    | Method | Endpoint                    | Notes |
|---------|--------|-----------------------------|--------|
| Health  | GET    | `/health`                   | App-level (not under `/api`) |
| Auth    | POST   | `/api/auth/login`           | Body: email, password |
| Auth    | POST   | `/api/auth/logout`          | |
| Auth    | GET    | `/api/auth/me`              | Bearer token |
| Students| GET    | `/api/students`             | List with school JOIN |
| Students| GET    | `/api/students/:id`         | |
| Students| POST   | `/api/students`             | school_name or school_id, student_number, first_name, last_name, … |
| Students| PATCH  | `/api/students/:id`         | Partial update |
| Students| DELETE | `/api/students/:id`         | |
| Schools | GET    | `/api/schools`              | |
| IEPs    | GET    | `/api/ieps`                 | Optional ?studentId= |
| IEPs    | GET    | `/api/ieps/:id`             | |
| IEPs    | POST   | `/api/ieps`                 | student_name or student_id; case_manager auto-resolved |
| IEPs    | PATCH  | `/api/ieps/:id`             | |
| IEPs    | POST   | `/api/ieps/:id/status`       | Body: { status: "review" \| "finalized" } |

## 5. Data Model (Current)

- **schools** — id, name, district_name, address, phone  
- **students** — id, school_id, student_number, first_name, last_name, date_of_birth, grade_level, guardian_contact  
- **users** — id, school_id, first_name, last_name, email, password_hash, role, is_active  
- **ieps** — id, student_id, case_manager_user_id, start_date, end_date, meeting_time (TIMESTAMPTZ), meeting_link, status (draft/review/finalized)  
- **iep_present_levels**, **iep_goals**, **goal_progress_updates**, **accommodations**, **iep_accommodations**, **assessments**, **teacher_observations** (schema in `db/initDB.js`)

---

## 6. New Plans

### 6.1 AI Assistant (Backend)

**Purpose:** Support the in-app AI assistant (present levels, goals, quality check, accommodations). All outputs are drafts; no auto-write to final IEP fields.

**New files:**

| File | Purpose |
|------|--------|
| `routes/assistant.routes.js` | Mount assistant API routes |
| `controllers/assistant.js`   | Request validation, call AI service, return JSON |
| `services/ai.service.js`    | Abstraction over LLM (prompt build, call, parse); optional `ai_generation_logs` write |

**New endpoints:**

| Method | Endpoint | Body / query | Response |
|--------|----------|--------------|---------|
| POST | `/api/assistant/present-levels` | `{ studentId, assessmentIds?, observationIds? }` | `{ draft: string, draftGenerated: true }` |
| POST | `/api/assistant/goals/generate` | `{ iepId?, areaOfNeed, baseline, targetDate? }` | `{ suggestions: [{ goalStatement, criteria, measurementMethod }] }` |
| POST | `/api/assistant/goals/analyze` | `{ goalStatement }` | `{ score, feedback, suggestions[] }` |
| POST | `/api/assistant/accommodations/suggest` | `{ studentId?, needs[], gradeLevel? }` | `{ suggestions: [{ accommodationId, title, rationale }] }` |
| POST | `/api/assistant/chat` (optional) | `{ message, context?: { studentId?, iepId? } }` | `{ reply: string }` — for orb/chat UI |

**Mount in `service.js`:**

```js
import assistantRoutes from './routes/assistant.routes.js'
// ...
app.use('/api/assistant', assistantRoutes)
```

**Auth:** All `/api/assistant/*` routes should use existing JWT middleware (e.g. require valid Bearer token). Optional: restrict by role (e.g. teacher/admin).

**AI service abstraction (in `services/ai.service.js`):**

- `generatePresentLevels(input)` — fetch assessments/observations, build prompt, return draft text.  
- `generateGoals(input)` — return array of suggested goal objects.  
- `analyzeGoalQuality(input)` — return score + suggestions.  
- `suggestAccommodations(input)` — return ranked list with rationale.  
- Optional: `chat(message, context)` for assistant orb conversation.

**Logging:** Phase 2: write to `ai_generation_logs` (user_id, feature_type, input_summary, output_summary, created_at).

---

### 6.2 Present Levels & Goals API (Planned)

- `PUT /api/ieps/:id/present-levels` — upsert present levels for an IEP.  
- `GET /api/ieps/:id/goals` — list goals.  
- `POST /api/ieps/:id/goals` — add goal.  
- `PATCH /api/goals/:goalId` — update goal.  
- `GET /api/goals/:goalId/progress` — list progress updates.  
- `POST /api/goals/:goalId/progress` — add progress entry.

**Files:** Extend `controllers/iep.js` or add `controllers/goals.js`, `controllers/progress.js`; add `routes/goals.routes.js`, `routes/progress.routes.js` if split.

---

### 6.3 Assessments & Observations (Planned)

- `POST /api/students/:id/assessments` — add assessment.  
- `GET /api/students/:id/assessments` — list.  
- `POST /api/students/:id/observations` — add observation.  
- `GET /api/students/:id/observations` — list.

**Files:** `controllers/assessments.js`, `controllers/observations.js`, `routes/assessments.routes.js`, `routes/observations.routes.js` (or nested under students).

---

### 6.4 Accommodations API (Planned)

- `GET /api/accommodations` — catalog.  
- `POST /api/ieps/:id/accommodations` — assign.  
- `DELETE /api/ieps/:id/accommodations/:accommodationId` — remove.

**Files:** `controllers/accommodations.js`, `routes/accommodations.routes.js`.

---

### 6.5 Middleware & Error Handling (Planned)

- **Auth middleware:** `middleware/auth.middleware.js` — verify JWT, attach `req.user`; use on protected routes.  
- **Central error handler:** `middleware/error.middleware.js` — map errors to consistent `{ error: { code, message } }` and status codes.  
- **Validation:** Request body/query validation (e.g. express-validator or custom in controllers) for new endpoints.

---

### 6.6 Phase 2 Backend

- Pagination for `GET /api/students`, `GET /api/ieps` (e.g. `?page=&limit=`).  
- `audit_logs` and `ai_generation_logs` tables and writes.  
- Optional: `GET /api/ieps/summary` for dashboard (counts by status, upcoming meetings).  
- Unit/integration tests for critical paths and assistant endpoints.
