# Frontend Design — IEP Management System

## 1. Purpose

This document defines the frontend design for the IEP Management System: structure, current implementation summary, and new plans. Completed items are summarized; new plans include file names and the AI assistant (orb + chat/panels).

## 2. Stack

- **Framework:** React  
- **Build:** Vite  
- **Routing:** react-router-dom  
- **HTTP:** Axios (apiClient with auth)  
- **Styling:** Global CSS (`App.css`)  
- **State:** React hooks; AuthContext for user/token  

## 3. Design Principles

- Minimize clicks for frequent tasks (view student, add meeting, open IEP).  
- Plain language; status and dates visible where relevant.  
- AI outputs are always editable and never auto-finalized.  
- Role-based visibility (teacher vs admin) where applicable.

## 4. Current Structure (Implemented)

```text
frontend/src/
  app/
    App.jsx                 # Routes + global AssistantOrb
    main.jsx
  context/
    AuthContext.jsx         # user, token, signIn, signOut, bootstrap
  pages/
    LoginPage.jsx
    DashboardPage.jsx
    StudentsPage.jsx
    StudentDetailPage.jsx
    MeetingPage.jsx
    IEPListPage.jsx
    IEPDetailPage.jsx       # Placeholder
    PrivacyPage.jsx
  components/
    dashboard/
      NavigationBar.jsx
      DashboardHeader.jsx
      ProfileAvatar.jsx
      KPICard.jsx
      QuickActions.jsx
      LoadingState.jsx
      ErrorAlert.jsx
    students/
      StudentsToolbar.jsx
      StudentsTable.jsx
      StudentsGrid.jsx
      AddStudentModal.jsx
    meeting/
      MeetingCalendarGrid.jsx
      MeetingCalendarHeader.jsx
      MeetingDayAgenda.jsx
      MeetingEventCard.jsx
      AddMeetingModal.jsx
    common/
      AssistantOrb.jsx      # Floating orb, bottom-right
  services/
    apiClient.js
    auth.service.js
    students.service.js
    school.service.js
    ieps.service.js
  styles/
    App.css
```

## 5. Current Routes (Implemented)

| Path | Page | Notes |
|------|------|--------|
| `/` | Redirect to `/login` | |
| `/login` | LoginPage | |
| `/dashboard` | DashboardPage | KPIs, upcoming events, quick actions |
| `/students` | StudentsPage | List/grid, filter, add modal |
| `/students/new` | StudentsPage | Opens Add Student modal |
| `/students/:id` | StudentDetailPage | Profile + school info |
| `/meeting` | MeetingPage | Calendar grid, add event modal |
| `/ieps` | IEPListPage | List of IEP events |
| `/ieps/new` | Redirect to `/meeting?openAddEvent=1` | |
| `/privacy` | PrivacyPage | |

## 6. Current API Usage (Implemented)

- **Auth:** `POST /api/auth/login`, `GET /api/auth/me`; token in localStorage; apiClient attaches Bearer.  
- **Students:** getStudents, getStudentById, AddStudent, updateStudentById, deleteStudentById.  
- **Schools:** getAllSchools (for add-student school list).  
- **IEPs:** getAllIeps, getIepBySId, addIepRecord (student_name, meeting_time, meeting_link, etc.), updateIepById, addIepStatus.

---

## 7. New Plans

### 7.1 AI Assistant (Frontend)

**Purpose:** Turn the floating orb into a usable assistant: chat and/or quick actions for present levels, goals, accommodations. All actions call new backend assistant endpoints; UI shows drafts and “insert/edit” only (no auto-save to IEP).

**New / updated files:**

| File | Purpose |
|------|--------|
| `components/common/AssistantOrb.jsx` | Keep orb; add state for open/closed panel; onClick opens panel/drawer. |
| `components/assistant/AssistantPanel.jsx` | Sliding panel or modal: tabs or sections for “Chat”, “Present levels”, “Goals”, “Accommodations”. |
| `components/assistant/AssistantChat.jsx` | Chat UI: message list + input; calls `POST /api/assistant/chat`. |
| `components/assistant/PresentLevelsGenerator.jsx` | Student/context picker, “Generate” button, draft display, “Insert” / “Edit then insert”. Calls `POST /api/assistant/present-levels`. |
| `components/assistant/GoalGenerator.jsx` | Inputs (area, baseline, date); “Generate”; show suggestions; “Use” / “Edit”. Calls `POST /api/assistant/goals/generate`. |
| `components/assistant/GoalAnalyzer.jsx` | Paste goal text; “Analyze”; show score + suggestions. Calls `POST /api/assistant/goals/analyze`. |
| `components/assistant/AccommodationSuggestions.jsx` | Needs/grade; “Suggest”; list with “Add to IEP”. Calls `POST /api/assistant/accommodations/suggest`. |
| `services/assistant.service.js` | `generatePresentLevels(payload)`, `generateGoals(payload)`, `analyzeGoal(payload)`, `suggestAccommodations(payload)`, `sendChatMessage(message, context)`. |

**Endpoint mapping (frontend → backend):**

| Frontend function | Backend endpoint |
|-------------------|------------------|
| `sendChatMessage(message, context)` | `POST /api/assistant/chat` |
| `generatePresentLevels({ studentId, assessmentIds, observationIds })` | `POST /api/assistant/present-levels` |
| `generateGoals({ iepId, areaOfNeed, baseline, targetDate })` | `POST /api/assistant/goals/generate` |
| `analyzeGoal({ goalStatement })` | `POST /api/assistant/goals/analyze` |
| `suggestAccommodations({ studentId, needs, gradeLevel })` | `POST /api/assistant/accommodations/suggest` |

**UI behavior:**

- Orb remains fixed bottom-right; click toggles AssistantPanel open/closed.  
- Panel shows disclaimer: “AI draft — requires educator review.”  
- No automatic write to IEP; user must choose “Insert” or “Add to IEP” after review.  
- Loading and error states for each action; optional “Retry”.

**Styling:** Reuse existing modal/panel patterns; add `.assistant-panel`, `.assistant-chat`, etc. in `App.css`.

---

### 7.2 IEP Editor (Planned)

- **Page:** `pages/IEPEditorPage.jsx` (or IEPDetailPage becomes editor).  
- **Route:** `/ieps/:id/edit` (or `/ieps/:id` with edit mode).  
- **Sections:** Plan details (dates, meeting), Present levels, Goals, Accommodations, Review.  
- **Components:** `IEPEditorLayout`, `PresentLevelsEditor`, `GoalEditor`, `AccommodationSelector`; use assistant components for “Generate” where applicable.  
- **API:** GET/PUT present-levels, GET/POST/PATCH goals, GET/POST/DELETE accommodations (when backend exists).

---

### 7.3 Student Profile Enhancements (Planned)

- **StudentDetailPage:** Add tabs or sections: Demographics (current), IEP history (list of IEPs with links), Assessments, Observations.  
- **Components:** `StudentIEPHistory.jsx`, `StudentAssessments.jsx`, `StudentObservations.jsx`.  
- **API:** Use `GET /api/students/:id`, then `GET /api/ieps?studentId=`, and (when built) assessments/observations endpoints.

---

### 7.4 Goal Progress (Planned)

- **Page:** e.g. `GoalProgressPage.jsx` or section inside IEP editor.  
- **Components:** `GoalProgressTable.jsx`, `ProgressEntryModal.jsx`.  
- **API:** `GET /api/goals/:goalId/progress`, `POST /api/goals/:goalId/progress`.

---

### 7.5 Dashboard Refinements (Planned)

- Optional: “Students list” preview with quick “View” links.  
- Use `GET /api/ieps/summary` when backend provides it for counts and upcoming meetings.  
- Keep existing KPI cards and upcoming events cards.

---

### 7.6 Shared UI and Consistency (Planned)

- Reuse `LoadingState`, `ErrorAlert`, modal overlay patterns.  
- Status badges (draft/review/finalized) consistent across IEP list, detail, and editor.  
- Optional: `AIPanel` wrapper used by PresentLevelsGenerator, GoalGenerator, etc., for consistent “draft + insert” UX.

---

### 7.7 Phase 2 Frontend

- Document center (uploads, links to IEPs).  
- Reporting/charts.  
- Accessibility pass and automated tests (e.g. key flows, assistant panel).
