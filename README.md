# IEP Management System

Full-stack prototype for managing students and IEP meetings/events.

- **Frontend:** React + Vite
- **Backend:** Express + PostgreSQL
- **Auth:** JWT (Bearer)
- **Main flows:** login, students CRUD, IEP/event scheduling calendar, IEP list, AI assistant (chat + stub endpoints)

## UI Preview

![IEP Management UI](frontend/src/assets/UI.png)

## Features

### Implemented

- **Auth:** JWT login, logout, `GET /api/auth/me`; token in localStorage; protected routes
- **Students:** List (table/grid), filter, add (modal), detail page; school auto-resolution/creation
- **IEP / Events:**
  - `meeting_time` (timestamp), `meeting_link`, status (`draft`, `review`, `finalized`)
  - Add-event modal with student name select/create; case manager auto-resolved
- **Meeting calendar:** Month navigation (Prev, Next, Today), today highlight, add-event modal, event tooltips
- **Routes:** `/students/new` (Add Student), `/students/:id` (detail), `/ieps/new` → meeting add-event modal
- **AI Assistant (stub):**
  - Floating orb (bottom-right); click opens assistant panel
  - Chat UI: send message → stub reply from `POST /api/assistant/chat`
  - All assistant endpoints require JWT; backend returns stub JSON until a real LLM is connected
  - See [docs/ASSISTANT_SETUP.md](docs/ASSISTANT_SETUP.md) for setup and extending with real AI

## AI-Powered Features (Planned Integration)

This prototype is designed to incorporate AI assistance for high-frequency IEP authoring tasks while keeping final decisions with educators.

### 1) Present Levels Summary Generator

- **Purpose:** Draft a present levels narrative (academic achievement + functional performance).
- **Inputs:** assessment scores, teacher observations, attendance/behavior notes (optional), recent progress updates.
- **Output:** editable text draft aligned to present-levels sections.
- **Human-in-the-loop:** case manager reviews and edits before saving.

### 2) Measurable Goal Generator

- **Purpose:** Produce draft annual goals from baseline data and identified needs.
- **Inputs:** area of need, baseline statement, target timeframe.
- **Output:** SMART-style goal options with suggested criteria and measurement method.
- **Human-in-the-loop:** educator selects, revises, and approves goal language.

### 3) Goal Quality Analyzer

- **Purpose:** Evaluate drafted goals for clarity and measurability.
- **Checks:** specificity, measurable criteria, realistic timeframe, baseline-target alignment.
- **Output:** quality score/flags plus concrete rewrite suggestions.
- **Human-in-the-loop:** recommendations are advisory only.

### 4) Accommodation Suggestion Assistant

- **Purpose:** Recommend accommodations linked to student needs and observed barriers.
- **Inputs:** present levels, disability-related needs, teacher notes, assessment patterns.
- **Output:** ranked accommodation suggestions with rationale and implementation notes.
- **Human-in-the-loop:** staff decides final accommodations.

### Suggested Workflow in This App

1. Import or enter student assessments/observations.
2. Generate present levels draft.
3. Generate measurable goals from present levels.
4. Run quality analyzer on selected goals.
5. Generate accommodation suggestions.
6. Save finalized content to IEP sections after staff review.

### Safety and Compliance Notes

- AI outputs are **draft assistance**, not automatic final decisions.
- Keep review/approval by authorized staff before publishing.
- Log generated content and edits for auditability.
- Avoid exposing sensitive data outside approved systems and policies.

## Project Structure

```text
.
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── db/           # initDB, migrations, migrate.js
│   ├── middleware/   # auth (JWT requireAuth)
│   ├── routes/
│   ├── script/       # seed, data JSON
│   └── service.js
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/   # dashboard, students, meeting, assistant, common
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── ...
├── docs/             # ASSISTANT_SETUP.md, etc.
├── BACKEND_DESIGN.md
├── FRONTEND_DESIGN.md
└── README.md
```

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local)
- `npm`

## Environment

Create `backend/.env`:

```env
PORT=5001
JWT_SECRET=replace-with-your-secret
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=iep_management
DB_PASSWORD=your_db_password
```

`DB_*` vars are optional in this codebase because backend has defaults, but setting them explicitly is recommended.

## Setup and Run

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Initialize database schema

**Option A — Migrations (recommended):** From the `backend` directory:

```bash
cd backend
npm run migrate
```

Migrations live in `backend/db/migrations/` (e.g. `00001_initial.sql`, `00002_add_meeting_link_to_ieps.sql`). The runner uses the same DB config as the app and records applied migrations in `schema_migrations`.

**Option B — Manual / initDB:** Run your schema setup from `backend/db/initDB.js` if you prefer. If `ieps` was created without `meeting_link`, run:

```sql
ALTER TABLE ieps ADD COLUMN IF NOT EXISTS meeting_link TEXT;
```

### 3) Seed demo data (optional but recommended)

```bash
cd backend
npm run data
```

### 4) Start backend

```bash
cd backend
npm run dev
```

Backend runs at `http://localhost:5001`.

### 5) Start frontend

```bash
cd frontend
npm run dev
```

Frontend runs at the Vite URL (typically `http://localhost:5173`).

## API Overview

Base URL: `http://localhost:5001/api`

### Auth

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Example:

```bash
curl -X POST "http://localhost:5001/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.johnson@school.org","password":"cxl458881"}'
```

### Students

- `GET /students`
- `GET /students/:id`
- `POST /students`
- `PATCH /students/:id`
- `DELETE /students/:id`

Create student example:

```bash
curl -X POST "http://localhost:5001/api/students" \
  -H "Content-Type: application/json" \
  -d '{
    "school_name":"Greenwood Elementary",
    "student_number":"S2345",
    "first_name":"Isabel",
    "last_name":"Chen",
    "grade_level":3
  }'
```

### IEPs / Events

- `GET /ieps` (supports optional `?studentId=...`)
- `GET /ieps/:id`
- `POST /ieps`
- `PATCH /ieps/:id`
- `POST /ieps/:id/status`

Create IEP/event example (current contract supports `student_name`):

```bash
curl -X POST "http://localhost:5001/api/ieps" \
  -H "Content-Type: application/json" \
  -d '{
    "student_name":"Isabel Chen",
    "meeting_time":"2026-03-05T14:30:00Z",
    "meeting_link":"https://zoom.us/j/123456789",
    "start_date":"2026-03-01",
    "end_date":"2027-03-01",
    "status":"draft"
  }'
```

Status transition example:

```bash
curl -X POST "http://localhost:5001/api/ieps/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"review"}'
```

### Schools

- `GET /schools`

### Assistant (JWT required)

All require `Authorization: Bearer <token>`.

- `POST /api/assistant/chat` — body: `{ message, context? }` → `{ reply, draftGenerated? }`
- `POST /api/assistant/present-levels` — body: `{ studentId? }` → `{ draft, draftGenerated }`
- `POST /api/assistant/goals/generate` — body: `{ areaOfNeed?, baseline?, targetDate? }` → `{ suggestions }`
- `POST /api/assistant/goals/analyze` — body: `{ goalStatement? }` → `{ score, feedback, suggestions }`
- `POST /api/assistant/accommodations/suggest` — body: `{ needs?, gradeLevel? }` → `{ suggestions }`

Responses are **stub** until a real AI service is wired in (see [docs/ASSISTANT_SETUP.md](docs/ASSISTANT_SETUP.md)).

## Frontend Routes

- `/login`
- `/dashboard`
- `/students`
- `/students/new` (opens Add Student flow)
- `/students/:id` (student detail)
- `/meeting`
- `/ieps`
- `/ieps/new` (redirects to meeting add-event modal)
- `/privacy`

## Demo login (after seed)

- **Email:** `alice.johnson@school.org`  
- **Password:** `cxl458881`  

If you can't login, re-seed so the users table has the correct password hashes: `cd backend && npm run data`.

## Notes

- `meeting_time` is the canonical field for meeting date/time.
- `POST /api/ieps` can resolve `student_name` to an existing student, and will auto-create a basic student record if needed.
- `case_manager_user_id` is auto-resolved server-side when not provided.

## Health Check

```bash
curl "http://localhost:5001/health"
```

Expected:

```json
{ "status": "healthy", "database": "PostgreSQL", "server": "iep-backend" }
```

---

## Design and planning

- **[BACKEND_DESIGN.md](BACKEND_DESIGN.md)** — API, data model, and backend plans (assistant, goals, assessments, etc.).
- **[FRONTEND_DESIGN.md](FRONTEND_DESIGN.md)** — Pages, components, and frontend plans (assistant panels, IEP editor, etc.).
- **[docs/ASSISTANT_SETUP.md](docs/ASSISTANT_SETUP.md)** — Step-by-step assistant setup and checklist.

---

## Unfinished / planned

Items below are not yet implemented; they are tracked in the design docs.

### Backend

- **AI assistant (real AI):** Replace stub responses in `controllers/assistant.js` with calls to an LLM (e.g. via `services/ai.service.js`). Add optional `ai_generation_logs` and request validation.
- **Present levels & goals API:** `PUT /api/ieps/:id/present-levels`, `GET/POST/PATCH` goals, `GET/POST` goal progress (see BACKEND_DESIGN.md §6.2).
- **Assessments & observations:** `GET/POST` for student assessments and observations (§6.3).
- **Accommodations API:** Catalog `GET /api/accommodations`, assign/remove for IEP (§6.4).
- **Middleware & errors:** Central error handler, validation (e.g. express-validator) for new endpoints (§6.5).
- **Phase 2:** Pagination for students/IEPs, `audit_logs` / `ai_generation_logs`, optional `GET /api/ieps/summary`, tests (§6.6).

### Frontend

- **Assistant panels (beyond chat):** Present-levels generator, goal generator, goal analyzer, accommodation suggestions — with “Generate” and “Insert”/“Add to IEP” (no auto-save). See FRONTEND_DESIGN.md §7.1.
- **IEP editor:** Full editor page (present levels, goals, accommodations, review); use assistant components for generation (§7.2).
- **Student profile:** Tabs/sections for IEP history, assessments, observations (§7.3).
- **Goal progress:** UI for progress entries per goal; calls goals/progress API when available (§7.4).
- **Dashboard:** Optional students preview; use `GET /api/ieps/summary` when implemented (§7.5).
- **Phase 2:** Document center, reporting, accessibility pass, automated tests (§7.7).