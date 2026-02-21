export default function MeetingEventCard({ event, onClick }) {
    if (!event) return null;

    const title = event.title || `IEP meeting with ${event.student_name || event.studentName || 'student'}`;
    const meta = event.status || 'draft';
    const meetingLink = event.meeting_link ||  '';
    const meetingTimeText = event.meeting_time
        ? new Date(event.meeting_time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : '-';

    return (
        <article className="meeting-event-card" onClick={() => onClick?.(event)}>
            <p className="meeting-event-time">{meetingTimeText}</p>
            <h4 className="meeting-event-title">{title}</h4>
            <p className="meeting-event-meta">{meta}</p>
            {meetingLink ? (
                <a
                    className="meeting-event-link"
                    href={meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                >
                    Join meeting link
                </a>
            ) : null}
        </article>
    );
}


// MeetingEventCard component guide
// Purpose:
// - Reusable display unit for one meeting entry.
//
// Suggested props:
// - event: { id, title, studentName, meeting_time, status, meetingLink }
// - compact: boolean for small (calendar cell) vs full (agenda panel) style.
// - onClick: open details handler.
//
// Display fields:
// - Time range / single time.
// - Student name and meeting title.
// - Status badge (draft/review/finalized).
// - Optional external meeting link.
//
// UX details:
// - If meetingLink exists, render "Join link".
// - If time invalid, show "-" instead of rendering epoch date.
// - Keep card clickable with clear hover/focus styles.
