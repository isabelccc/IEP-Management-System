import { useEffect, useState } from 'react';
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { useAuth } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom'
import LoadingState from '../components/dashboard/LoadingState';
import ErrorAlert from '../components/dashboard/ErrorAlert';
import { getStudents } from '../services/students.service';
import { getIepBySId } from '../services/ieps.service';
import KPISection from '../components/dashboard/KPICard';
import QuickActions from '../components/dashboard/QuickActions'
import NavigationBar from '../components/dashboard/NavigationBar'

function DashboardPage() {


    const { user, signOut } = useAuth(); // get from auth context
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [students, setStudents] = useState([]);
    const [ieps, setIeps] = useState([]);

    const handleLogout = async () => {
        await signOut();
        navigate('/login');

    };


    useEffect(() => {
        if (!user) return;

        const loadDashboardData = async () => {
            try {
                setLoading(true);
                setError('');

                const studentsRes = await getStudents();
                const studentList = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
                setStudents(studentList);

                const iepResults = await Promise.allSettled(
                    studentList.map((s) => getIepBySId(s.id))
                );

                const mergedIeps = iepResults.flatMap((result) => {
                    if (result.status !== 'fulfilled') return [];
                    const payload = result.value?.data;
                    if (!payload) return [];
                    return Array.isArray(payload) ? payload : [payload];
                });

                setIeps(mergedIeps);
            } catch (err) {
                const message = err?.response?.data?.error || err?.message || 'Failed to load dashboard data';
                setError(message);
            } finally {
                setLoading(false);
            }
        };


        loadDashboardData();
    }, [user]);


    const totalStudents = students.length;
    const totalIeps = ieps.length;
    const draftIeps = ieps.filter((e) => e.status === 'draft').length;
    const reviewIeps = ieps.filter((e) => e.status === 'review').length;
    const finalizedIeps = ieps.filter((e) => e.status === 'finalized').length;
    const cards = [
        // TODO: replace hardcoded values with derived state values (totalStudents, totalIeps, etc.).
        { label: "Total Students", value: totalStudents, onClick: () => navigate("/students") },
        { label: "Total IEPs", value: totalIeps, onClick: () => navigate("/ieps") },
        { label: "Draft", value: draftIeps, onClick: () => navigate("/ieps?status=draft") },
        { label: "Review", value: reviewIeps, onClick: () => navigate("/ieps?status=review") },
        { label: "Finalized", value: finalizedIeps, onClick: () => navigate("/ieps?status=finalized") },
    ];

    // TODO (Upcoming Events):
    // 1) Build a derived array from `ieps`:
    //    - keep only rows with valid `meeting_time`
    //    - sort ascending by meeting date/time
    //    - keep top 3-5 records for dashboard preview
    // 2) For each event, display:
    //    - student name (lookup from `students` using student_id)
    //    - meeting date/time (formatted)
    //    - optional status chip (draft/review/finalized)
    // 3) Empty state:
    //    - "No upcoming meetings"
    const iepsRecent = [...ieps]
        .filter((i) => {
            if (!i.meeting_time) return false;
            const d = new Date(i.meeting_time);
            if (Number.isNaN(d.getTime())) return false;
            return d >= new Date();
        })
        .sort((a, b) => new Date(a.meeting_time) - new Date(b.meeting_time));

    const formatMeetingTime = (raw) => {
        if (!raw) return '-';
        const d = new Date(raw);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString();
    };

    const getStudentName = (studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return `Student #${studentId}`;
        return `${student.first_name} ${student.last_name}`;
    };

    const getMeetingLink = (iep) => {
        return iep?.meeting_link || iep?.meeting_url || 'https://zoom.us/';
    };
    // TODO (Students List Preview):
    // 1) Build a preview list from `students` (top 5-8 rows).
    // 2) Show columns:
    //    - student full name
    //    - grade level
    //    - school name
    // 3) Add "View all" action -> navigate('/students')
    // 4) Empty state:
    //    - "No students yet"


    function addIEP() {
        // TODO: ensure route exists in App.jsx ("/ieps/new").
        navigate('/ieps/new')

    }


    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-shell">
            <NavigationBar onLogout={handleLogout} />
            <main className="dashboard-main">
                
                <DashboardHeader user={user} />

                {loading && <LoadingState message="Loading dashboard..." />}
                {error && <ErrorAlert message={error} />}
                <KPISection
                    // TODO: consider renaming prop `card` -> `cards` for clarity.
                    cards={cards}
                />
                <section className="dashboard-panel">
                    <div className="dashboard-panel-header">
                        <h3>Upcoming Events</h3>
                        <p>{iepsRecent.length} result(s)</p>
                    </div>

                    {iepsRecent.length === 0 ? (
                        <p className="dashboard-empty">No upcoming meetings</p>
                    ) : (
                        <div className="meeting-card-list">
                            {iepsRecent.map((e) => (
                                <article key={e.id} className="meeting-card">
                                    <p className="meeting-card-time">
                                        Starting on {formatMeetingTime(e.meeting_time)}
                                    </p>
                                    <h4 className="meeting-card-title">{getStudentName(e.student_id)} IEP Meeting</h4>
                                    <a
                                        className="meeting-card-link"
                                        href={getMeetingLink(e)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Join meeting link
                                    </a>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
                

                

                {/* TODO: Add "Students List" preview section here.
                Suggested structure:
                <section className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <h3>Students List</h3>
                    <button onClick={() => navigate('/students')}>View all</button>
                  </div>
                  <ul>...</ul>
                </section>
            */}

            </main>


        </div>
    );
}

// DashboardPage component checklist (build in this order)

// 1) Top-level page shell
// - DashboardPage container/wrapper
// - Page title + subtitle
// - Consistent spacing/layout class

// 2) Header / top bar
// - App/brand title
// - Current user name + role badge
// - Logout button
// - Optional quick search input

// 3) Global status area
// - Loading indicator (while initial dashboard data loads)
// - Error banner (API failure / auth failure)
// - Empty-state message (no data available)

// 4) KPI summary cards
// - Total students
// - Total active IEPs
// - IEPs in draft
// - IEPs in review
// - IEPs finalized

// 5) Quick actions panel
// - "Add Student" button
// - "Create IEP" button
// - "View Students" button
// - "View IEPs" button

// 6) Recent/priority lists
// - Recent students list/table
// - Recent IEP updates list
// - Upcoming meetings list (meeting_time based)
// - Overdue/review-needed alerts section

// 7) Filter/sort controls
// - School filter (if multi-school)
// - Grade filter
// - Status filter (draft/review/finalized)
// - Sort by updated date / meeting date

// 8) Reusable dashboard widgets (separate components)
// - StatCard
// - SectionCard
// - DataTable (or mini table)
// - EmptyState
// - ErrorAlert
// - LoadingSkeleton

// 9) Route/navigation integration
// - Links to /students
// - Links to /ieps
// - Link to /ieps/:id from recent items
// - Protected route behavior (redirect if not authenticated)

// 10) Data hooks/services used by dashboard
// - useAuth() for user + signOut
// - students.service (count/list)
// - ieps.service (count/list/status summaries)
// - Optional custom hook: useDashboardData()

// 11) UX/accessibility
// - Semantic headings (h1/h2)
// - Button labels and aria where needed
// - Keyboard-focus visible states
// - Responsive layout (mobile/tablet/desktop)

// 12) Nice-to-have later
// - Charts/trends (IEP status over time)
// - Saved filter presets
// - Notifications badge
// - Last refreshed timestamp
export default DashboardPage;
