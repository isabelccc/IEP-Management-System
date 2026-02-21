# Frontend Design - IEP Management System

## 1) Purpose

This document defines a detailed frontend design for an IEP Management System prototype.  
The frontend should support teachers and administrators in creating, reviewing, and tracking IEPs quickly and accurately.

## 2) Frontend Stack

- Framework: `React` (current project setup)
- Build tool: `Vite`
- HTTP client: `axios`
- Styling: CSS Modules or utility-first CSS (choose one and keep consistent)
- State approach:
  - Local UI state with React hooks for simple forms
  - Feature-level state in context providers (auth, current student, filters)
  - Optional upgrade path: Redux Toolkit if app complexity grows

## 3) Design Principles

- Minimize clicks for high-frequency tasks (view student, update goal progress, finalize IEP section)
- Keep long forms broken into manageable sections with autosave
- Use plain language labels for education staff
- Show status and due-date visibility on every relevant screen
- AI suggestions should always be editable and never auto-finalized

## 4) App Information Architecture

### Primary navigation
- Dashboard
- Students
- IEPs
- Tasks / Compliance
- Reports (optional in MVP)
- Settings

### Role-based visibility
- Teacher/Case Manager: student caseload, IEP authoring, progress tracking
- Admin: all school students, review queues, compliance and completion summaries

## 5) Page-Level Design

### A. Login Page
- Inputs: email, password
- Actions: sign in, reset password link (optional)
- Validation: required fields, invalid credentials handling
- Output: auth token stored securely (httpOnly cookie preferred)

### B. Dashboard
- Teacher view cards:
  - My students
  - IEPs in draft/review
  - Upcoming annual review dates
  - Goal progress overdue
- Admin view cards:
  - Total active IEPs
  - Finalization rate
  - Missing sections count
  - Compliance deadlines this month

### C. Students List
- Table fields: student number, name, grade, case manager, IEP status
- Features: search, filter by grade/status/case manager, pagination
- Actions: open profile, create new IEP

### D. Student Profile
- Sections/tabs:
  - Demographics
  - IEP history
  - Assessments
  - Teacher observations
  - Documents
- Quick actions:
  - Add assessment
  - Add observation
  - Start new IEP

### E. IEP Editor (Core Screen)
- Multi-step tabs:
  1. Plan details (dates, meeting info, status)
  2. Present levels
  3. Measurable goals
  4. Accommodations
  5. Progress plan / services (if included)
  6. Review and finalize
- Features:
  - Sticky side progress indicator for section completion
  - Autosave + manual save
  - Inline validation messages
  - Change history panel (future enhancement)

### F. Goal Progress Screen
- Goal cards/table with baseline, target, latest progress
- Add progress update modal:
  - Date
  - Numeric/qualitative progress value
  - Progress note
- Trend view (simple sparkline or status badge in MVP)

### G. Compliance / Tasks Screen
- List upcoming deadlines and incomplete workflow tasks
- Filters by due date range and assigned user
- Bulk actions for admins (assign/reassign task)

## 6) AI UX Design

### AI components
- Reusable `AIPanel` component with:
  - Inputs summary
  - Generate button
  - Loading, error, and retry states
  - Draft output with "Insert", "Replace", and "Edit before insert"

### AI use cases in UI
1. Present levels summary generator
   - Source data picker: assessments + observations
   - Generated output shown side-by-side with editable text area

2. Goal generator
   - Inputs: need area, baseline, target timeline
   - Output: suggested measurable goal statement

3. Goal quality analyzer
   - Input: current goal statement
   - Output: quality score + improvement suggestions

4. Accommodation suggestions
   - Inputs: student needs tags, grade, domain
   - Output: ranked accommodation list with add-to-IEP action

### AI safety UX rules
- Display "AI draft - requires educator review"
- Keep full user control for acceptance/rejection
- Log AI usage events in backend for traceability

## 7) Component Design

### Shared UI components
- `AppShell`, `TopNav`, `SideNav`
- `DataTable`, `FilterBar`, `StatusBadge`, `DateChip`
- `FormSection`, `FormField`, `AutosaveIndicator`
- `ConfirmDialog`, `Toast`, `InlineError`
- `AIPanel`, `AIGeneratedTextCard`

### Feature components
- Student module: `StudentList`, `StudentCard`, `StudentProfileTabs`
- IEP module: `IEPWizard`, `PresentLevelsEditor`, `GoalEditor`, `AccommodationSelector`
- Progress module: `GoalProgressTable`, `ProgressEntryModal`
- Tasks module: `ComplianceTaskList`

## 8) State Management Design

### Recommended store slices (context or Redux)
- `auth`: current user, role, token/session status
- `students`: list, filters, selected student
- `ieps`: active IEP, section completeness, save status
- `goals`: goals list, progress entries
- `tasks`: compliance task list
- `ai`: last request state, generated drafts, errors

### Caching strategy
- Cache list views with short TTL
- Refetch on critical mutations (save IEP, add goal progress)
- Use optimistic updates only for low-risk operations (non-critical notes)

## 9) API Integration Contract (Frontend Perspective)

- Base URL from environment: `VITE_API_BASE_URL`
- Use centralized API client:
  - Attach auth headers/session
  - Standardize error parsing
  - Retry policy for transient failures

### Core endpoint groups expected
- `/auth` - login/session
- `/students` - list, detail, create/update
- `/ieps` - create, edit, finalize, status update
- `/goals` and `/goal-progress` - goal CRUD and progress logging
- `/assessments` and `/observations` - input data for IEP + AI
- `/accommodations` - catalog and selection
- `/ai/*` - generation and analysis endpoints

## 10) Validation and Error Handling

- Field-level validation:
  - Required fields for status transitions (e.g., finalize requires critical sections)
  - Date logic checks (end date >= start date)
- API error handling:
  - Human-readable toast
  - Inline errors for form fields when possible
  - Non-blocking warnings for recoverable issues

## 11) Accessibility and Usability

- Keyboard-first navigation for all forms and tables
- ARIA labels for critical controls
- Color contrast standards for status badges and alerts
- Form labels and error messages explicitly tied to inputs
- Avoid information-only color coding; include text/icon indicators

## 12) Security Considerations (Frontend)

- Avoid storing sensitive data in local storage when possible
- Never expose secrets in client code
- Sanitize and encode user-entered text before rendering
- Enforce role-based rendering for restricted actions

## 13) MVP Frontend Deliverables

1. Auth + role-based navigation
2. Student list/profile flow
3. IEP editor with sections:
   - plan details
   - present levels
   - goals
   - accommodations
4. Goal progress logging screen
5. At least two AI workflows integrated (present levels + goal generator)
6. Dashboard with teacher/admin summaries

## 14) Phase 2 Frontend Enhancements

- Full document center with uploads and preview
- Advanced reporting charts
- Collaboration comments and mentions
- Autosave conflict resolution
- Full accessibility audit and testing automation
# Frontend Implementation Guide (Post-Axios)

This guide assumes:
- `apiClient.js` is done
- backend is running on `http://localhost:5001`
- API base is `/api/...`

---

## 1) Build Authentication First

### 1.1 Create/confirm auth service
Use:
- `login(email, password)` -> `POST /api/auth/login`
- `logout()` -> `POST /api/auth/logout`
- `getMe()` -> `GET /api/auth/me`

### 1.2 Add auth state management
Create:
- `src/context/AuthContext.jsx`

State:
- `user`
- `token`
- `loading`

Actions:
- `signIn(email, password)`
- `signOut()`
- `bootstrapAuth()` (on app load, validate token with `/auth/me`)

Store token in `localStorage` and let Axios interceptor attach it.

### 1.3 Create Login page
Create:
- `src/pages/LoginPage.jsx`

Needs:
- email/password form
- loading state
- backend error display
- redirect on success

---

## 2) Add Routing + Route Guards

### 2.1 Install router
npm i react-router-dom


// DashboardPage: specific component plan for your current project

// ===============================
// A) FILES TO CREATE (component-level)
// ===============================
// src/pages/DashboardPage.jsx
// src/components/dashboard/DashboardHeader.jsx
// src/components/dashboard/KPISection.jsx
// src/components/dashboard/KPICard.jsx
// src/components/dashboard/QuickActions.jsx
// src/components/dashboard/RecentStudentsTable.jsx
// src/components/dashboard/RecentIepsTable.jsx
// src/components/dashboard/UpcomingMeetingsList.jsx
// src/components/common/LoadingState.jsx
// src/components/common/ErrorAlert.jsx
// src/components/common/EmptyState.jsx
// src/hooks/useDashboardData.js
// src/styles/dashboard.css

// ===============================
// B) DashboardPage.jsx (exact sections)
// ===============================
// 1) <DashboardHeader />
//    - Props: user, onLogout
//
// 2) status area
//    - if loading: <LoadingState message="Loading dashboard..." />
//    - if error: <ErrorAlert message={error} />
//
// 3) <KPISection />
//    - cards for:
//      - totalStudents
//      - totalIeps
//      - draftIeps
//      - reviewIeps
//      - finalizedIeps
//
// 4) <QuickActions />
//    - buttons:
//      - Add Student  -> navigate('/students/new')
//      - Create IEP   -> navigate('/ieps/new')
//      - View Students -> navigate('/students')
//      - View IEPs     -> navigate('/ieps')
//
// 5) content grid (2 columns desktop)
//    - left:
//      - <RecentStudentsTable students={recentStudents} />
//      - <RecentIepsTable ieps={recentIeps} />
//    - right:
//      - <UpcomingMeetingsList meetings={upcomingMeetings} />
//
// 6) empty states
//    - no students -> EmptyState("No students yet")
//    - no ieps -> EmptyState("No IEP records yet")
//    - no meetings -> EmptyState("No upcoming meetings")

// ===============================
// C) DATA SOURCE MAPPING (use existing services)
// ===============================
// From students.service:
// - getStudents() -> totalStudents + recentStudents (top 5)
//
// From ieps.service:
// - get all ieps per selected student currently exists
// - for dashboard summary, add/need a backend endpoint:
//   GET /api/ieps/summary
//   response shape:
//   {
//     totalIeps: number,
//     byStatus: { draft: number, review: number, finalized: number },
//     recentIeps: [],
//     upcomingMeetings: []
//   }
//
// If summary endpoint not ready:
// - temporary approach: fetch IEPs per key students and aggregate client-side.

// ===============================
// D) KPI card labels + formulas
// ===============================
// Total Students      = students.length
// Total IEPs          = ieps.length
// Draft IEPs          = ieps.filter(s => s.status === 'draft').length
// Review IEPs         = ieps.filter(s => s.status === 'review').length
// Finalized IEPs      = ieps.filter(s => s.status === 'finalized').length

// ===============================
// E) TABLE COLUMNS (specific)
// ===============================
// RecentStudentsTable columns:
// - Student # (student_number)
// - Name (first_name + last_name)
// - Grade (grade_level)
// - School ID (school_id)
// - Action (View)
//
// RecentIepsTable columns:
// - IEP ID
// - Student ID
// - Status
// - Meeting Date
// - End Date
// - Action (Open)

// UpcomingMeetingsList item format:
// - Student name (or student_id until join endpoint exists)
// - Meeting date
// - Status badge
// - Link to IEP detail

// ===============================
// F) HEADER details
// ===============================
// DashboardHeader should include:
// - title: "IEP Dashboard"
// - subtitle: "Overview and quick actions"
// - right side:
//   - "Signed in as {firstName} {lastName} ({role})"
//   - Logout button (calls signOut + navigate('/login'))

// ===============================
// G) ROUTING requirements (App.jsx)
// ===============================
// - /dashboard -> DashboardPage
// - guard with auth check:
//   if !isAuthenticated -> Navigate('/login')
// - /login should redirect to /dashboard if already authenticated

// ===============================
// H) CSS blocks to include in dashboard.css
// ===============================
// .dashboard-page
// .dashboard-header
// .dashboard-grid
// .kpi-grid
// .kpi-card
// .status-badge-draft / review / finalized
// .table-card
// .quick-actions
// .side-panel
// responsive breakpoints for <= 1024 and <= 640

// ===============================
// I) FIRST ITERATION (minimum shippable)
// ===============================
// 1. Header + logout
// 2. 5 KPI cards (even with placeholder data)
// 3. Quick action buttons
// 4. Recent IEP list
// 5. Loading/error states
// 6. Replace placeholder data with API responses

school_id = COALESCE($1,school_id),
            student_number = COALESCE($2,student_number),
            first_name = COALESCE($3,first_name),
            last_name = COALESCE($4,last_name),
            date_of_birth = COALESCE($5,date_of_birth),
            grade_level =COALESCE($6,grade_level),
            guardian_contact = COALESCE($7,guardian_contact),
            updated_at = NOW()
            WHERE id = $8
            RETURNING *