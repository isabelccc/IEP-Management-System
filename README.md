# IEP Management System Prototype

## What an IEP Management System Is

An **IEP (Individualized Education Program) Management System** is a software platform used by public and private schools to create, track, store, and manage IEPs for K-12 students receiving special education services under IDEA (Individuals with Disabilities Education Act).

It supports compliant documentation, collaboration across school staff, and progress monitoring for each student's educational plan.

Reference: https://www.powerschool.com/blog/special-education-software/

## Project Goal

Design and present a functional prototype of an IEP Management System that is intuitive, practical, and aligned with real school workflows for teachers and administrators.


curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice.johnson@school.org", "password": "cxl458881"}'
curl -X POST http://localhost:5001/api/students \
   -H "Content-Type: application/json" \
   -d '{"school_id": "1", "first_name": "Isabel", "last_name":"Chen","student_number":"S2345"}'


curl -i "http://localhost:5001/api/ieps?studentId=3"


curl -i -X PATCh http://localhost:5001/api/students\8 \
   -H "Content-Type: application/json" \
   -d '{"student_number":"S1234"}'
curl -i -X PATCH http://localhost:5001/api/students/8 \
  -H "Content-Type: application/json" \
  -d '{"student_number":"S1234"}'

curl -i http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3MTQ3NTQ3MywiZXhwIjoxNzcyMDgwMjczfQ.NhIDmoma8MXrZAx3ue_24dJcWyXdW7KF5nCiut56zhM"
## Core Requirements

The prototype should:

1. Be intuitive and user-friendly for both teachers and administrators.
2. Be presentable and functional, demonstrating key platform capabilities.
3. Support end-to-end IEP lifecycle activities, including creation, tracking, storage, and management.
4. Include AI-powered tools that assist staff with drafting and improving IEP content.

## Key User Roles

- **Teacher / Case Manager**
  - Create and edit student IEPs.
  - Enter progress data, observations, and updates.
  - Use AI tools to draft present levels and measurable goals.

- **Administrator**
  - Review and oversee IEP completion status.
  - Monitor timelines and compliance checkpoints.
  - Access reports and quality indicators.

## Functional Scope (Prototype Features)

### 1) Student and IEP Profile Management
- Create and maintain student records relevant to IEP planning.
- View active and historical IEPs.
- Organize IEP sections in a structured, easy-to-navigate format.

### 2) IEP Authoring Workflow
- Create a new IEP draft.
- Edit key sections such as present levels, goals, services, and accommodations.
- Save drafts and continue later.
- Track status (draft, review, finalized).

### 3) Progress and Documentation Tracking
- Record progress updates tied to measurable goals.
- Log teacher observations and assessment inputs.
- Maintain a clear timeline/history of updates.

### 4) Search, Retrieval, and Storage
- Quickly find student records and IEP documents.
- Ensure all IEP-related artifacts are organized and retrievable.

### 5) Dashboard and Oversight
- Provide role-appropriate summaries (teacher vs. admin views).
- Show items requiring action (e.g., upcoming deadlines, missing sections).
- Surface high-level indicators of completion and quality.

## Database Tables Needed (Prototype)

Build the **minimum tables first** (MVP), then add extended tables in phase 2.

### Minimum Tables (Build First)

1. `users`
   - Stores teacher/admin accounts.
   - Example fields: `id`, `first_name`, `last_name`, `email`, `password_hash`, `role`, `is_active`, `created_at`.

2. `students`
   - Stores student profile data.
   - Example fields: `id`, `student_number`, `first_name`, `last_name`, `date_of_birth`, `grade_level`, `guardian_contact`, `created_at`.

3. `ieps`
   - Main IEP record per student and plan period.
   - Example fields: `id`, `student_id`, `case_manager_user_id`, `status` (draft/review/finalized), `start_date`, `end_date`, `meeting_time`, `created_at`, `updated_at`.

4. `iep_present_levels`
   - Stores present levels narrative.
   - Example fields: `id`, `iep_id`, `academic_summary`, `functional_summary`, `baseline_notes`, `updated_by_user_id`, `updated_at`.

5. `iep_goals`
   - Stores measurable annual goals.
   - Example fields: `id`, `iep_id`, `goal_area`, `baseline_statement`, `goal_statement`, `measurement_method`, `criteria`, `target_date`, `status`, `created_at`.

6. `goal_progress_updates`
   - Stores progress monitoring updates for goals.
   - Example fields: `id`, `iep_goal_id`, `progress_date`, `progress_value`, `progress_note`, `reported_by_user_id`, `created_at`.

7. `accommodations`
   - Master list of accommodation options.
   - Example fields: `id`, `title`, `category`, `description`, `is_active`, `created_at`.

8. `iep_accommodations`
   - Junction table linking accommodations to a specific IEP.
   - Example fields: `id`, `iep_id`, `accommodation_id`, `notes`, `created_at`.

9. `assessments`
   - Stores scores and assessment inputs used in IEP drafting.
   - Example fields: `id`, `student_id`, `assessment_name`, `assessment_date`, `score_value`, `score_type`, `notes`, `entered_by_user_id`, `created_at`.

10. `teacher_observations`
    - Stores observation notes for present levels and goal planning.
    - Example fields: `id`, `student_id`, `observation_date`, `observation_text`, `domain`, `entered_by_user_id`, `created_at`.

### Extended Tables (Phase 2)

1. `schools`
   - Add for multi-school support.
   - Example fields: `id`, `name`, `district_name`, `address`, `phone`, `created_at`.

2. `services`
   - Stores related/special education services.
   - Example fields: `id`, `iep_id`, `service_type`, `frequency`, `duration_minutes`, `location`, `provider_user_id`, `start_date`, `end_date`.

3. `compliance_tasks`
   - Tracks due dates and completion checkpoints.
   - Example fields: `id`, `iep_id`, `task_type`, `due_date`, `status`, `assigned_user_id`, `completed_at`, `notes`.

4. `documents`
   - Stores metadata for uploaded/generated files.
   - Example fields: `id`, `student_id`, `iep_id`, `file_name`, `file_url`, `document_type`, `uploaded_by_user_id`, `created_at`.

5. `ai_generation_logs`
   - Tracks AI outputs and feature usage.
   - Example fields: `id`, `iep_id`, `feature_type`, `input_summary`, `output_text`, `created_by_user_id`, `created_at`.

6. `audit_logs`
   - Tracks important user actions.
   - Example fields: `id`, `user_id`, `entity_type`, `entity_id`, `action_type`, `action_detail`, `created_at`.

## Minimum Relationships (High Level, MVP)

- One `student` has many `ieps`, `assessments`, and `teacher_observations`.
- One `iep` has many `iep_goals`.
- One `iep_goal` has many `goal_progress_updates`.
- `accommodations` is linked to `ieps` via `iep_accommodations` (many-to-many).

## AI-Powered Feature Requirements

Include one or more of the following AI capabilities in the prototype (preferably all):

1. **Present Levels Summary Generator**
   - Inputs: assessment scores, teacher observations, functional performance notes.
   - Output: draft present levels narrative (academic achievement and functional performance).

2. **Measurable Goal Generator**
   - Inputs: baseline data and area of need.
   - Output: draft measurable annual goals.

3. **Goal Quality Analyzer**
   - Reviews drafted goals for clarity and measurability.
   - Flags weak wording and suggests improvements.

4. **Accommodation Suggestion Assistant**
   - Suggests potential accommodations based on identified student needs.
   - Provides editable recommendations (human review required).

## Usability Requirements

- Clear navigation with minimal clicks for common tasks.
- Clean, readable interface suitable for frequent staff use.
- Forms and workflows designed for non-technical users.
- Fast access to critical student and IEP information.

## Non-Functional Expectations (Prototype Level)

- **Reliability:** Core flows should work consistently during demonstrations.
- **Data Organization:** Records should be logically structured and easy to retrieve.
- **Privacy Mindset:** Prototype should reflect awareness of sensitive student data handling.
- **Scalability Direction:** Design should suggest how additional schools/students could be supported over time.

## Suggested Demo Scenarios

The prototype demonstration should show:

1. Creating or opening a student profile.
2. Drafting an IEP section with AI assistance.
3. Reviewing and improving AI-generated content.
4. Tracking progress on at least one measurable goal.
5. Admin view of status/compliance indicators.

## Success Criteria

The project is successful if reviewers can clearly see that the prototype:

- Solves the central IEP management workflow.
- Is easy for teachers and admins to use.
- Demonstrates meaningful AI support for documentation quality and efficiency.
- Is polished and presentable as a practical education technology concept.


fetch("http://localhost:5001/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "alice.johnson@school.org",
    password: "cxl458881",
  }),
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

fetch("http://localhost:5001/api/ieps/2", {
  method: "GET"
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
fetch("http://localhost:5001/api/students", {
  method: "GET"
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);


fetch("http://localhost:5001/api/students/2", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    grade_level: 2
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

curl -i -X POST "http://localhost:5001/api/ieps/2" \
  -H "Content-Type: application/json" \
  -d '{"status":"draft"}'
curl -i -X DELETE "http://localhost:5001/api/students/3"

curl -i -X POST "http://localhost:5001/api/ieps/1/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"review"}'