
// MeetingPage build guide (comment-only scaffold)
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllIeps } from '../services/ieps.service';
import MeetingCalendarGrid from '../components/meeting/MeetingCalendarGrid'
import NavigationBar from '../components/dashboard/NavigationBar'
import AddMeetingModal from '../components/meeting/AddMeetingModal';
export default function MeetingPage() {
    const { user, signOut } = useAuth(); 
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ieps, setIeps] = useState([]);
    const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
    const [selectedDay, setSelectedDay] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    const handleLogout = async () => {
        await signOut();
        navigate('/login');

    };
    useEffect(() => {

        if (!user) return;
        const loadIepsData = async () => {
            setLoading(true);

            try {
                const ieps = await getAllIeps();
                const iepsData = Array.isArray(ieps?.data)? ieps.data:[];
                setIeps(iepsData)

            }

            catch (err) {
                const message = err?.response?.data?.error || err?.message || 'Failed to load dashboard data';
                setError(message);

            }
            finally {
                setLoading(false);
            }
        }
        loadIepsData();

    }, [user])

    useEffect(() => {
        if (searchParams.get('openAddEvent') === '1') {
            setIsAddMeetingOpen(true);
        }
    }, [searchParams]);

    const handleOpenAddMeeting = () => {
        setIsAddMeetingOpen(true);
    };

    const handleCloseAddMeeting = () => {
        setIsAddMeetingOpen(false);
        if (searchParams.get('openAddEvent') === '1') {
            navigate('/meeting', { replace: true });
        }
    };

    const handleMeetingAdded = (createdIep) => {
        if (!createdIep || !createdIep.id) return;
        setIeps((prev) => {
            if (prev.some((i) => i.id === createdIep.id)) return prev;
            return [createdIep, ...prev];
        });
    };

    return (
        <div className="app-shell">
             <NavigationBar onLogout={handleLogout} />
            <MeetingCalendarGrid
                ieps={ieps}
                selectedDate={selectedDay}
                onSelectDate={setSelectedDay}
                onAddEvent={handleOpenAddMeeting}
            />
            <AddMeetingModal
                isOpen={isAddMeetingOpen}
                onClose={handleCloseAddMeeting}
                onSuccess={handleMeetingAdded}
            />
        </div>
    )
}

// 2) Page layout:
//    - Header row: page title, subtitle, Today button, view-mode switch (Month/Week/Day).
//    - Main content: calendar grid on left + selected-day agenda panel on right.
//
// 3) Data loading:
//    - Fetch meetings from IEP API (meeting_time based).
//    - Keep local state for loading/error and event list.
//
// 4) Data transform:
//    - Convert API rows to event objects:
//      id, title, studentName, startTime, endTime, status, meetingLink.
//    - Skip invalid timestamps safely.
//
// 5) Interaction:
//    - Click day cell => open selected-day agenda.
//    - Click event card => open meeting detail panel/modal.
//    - Click link => open meeting URL in new tab.
//
// 6) UX states:
//    - Loading state while fetching events.
//    - Error banner when request fails.
//    - Empty state when no meetings in current range.
//
// 7) Components to compose:
//    - MeetingCalendarHeader
//    - MeetingCalendarGrid
//    - MeetingDayAgenda
//    - MeetingEventCard
