import { useEffect, useRef, useState } from 'react';

export default function MeetingCalendarGrid({ ieps, selectedDate, onSelectDate, onSelectEvent, onAddEvent }) {
    const containerRef = useRef(null);
    const [currentDate, setCurrentDate] = useState(() => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    });
    const [viewMode, setViewMode] = useState('month');
    const [activeEvent, setActiveEvent] = useState(null);
    const anchorDate = new Date(`${currentDate}T00:00:00`);
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const monthLabel = anchorDate.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
    });

    const toDateKey = (value) => {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const goPrevMonth = () => {
        const d = new Date(`${currentDate}T00:00:00`);
        d.setMonth(d.getMonth() - 1);
        d.setDate(1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        setCurrentDate(`${y}-${m}-01`);
    };
    const goNextMonth = () => {
        const d = new Date(`${currentDate}T00:00:00`);
        d.setMonth(d.getMonth() + 1);
        d.setDate(1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        setCurrentDate(`${y}-${m}-01`);
    };
    const goToday = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateKey = `${y}-${m}-${day}`;
        setCurrentDate(`${y}-${m}-01`);
        onSelectDate?.(dateKey);
    };

    const todayKey = (() => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    })();

    const days = [
        ...Array.from({ length: firstDayIndex }, () => null),
        ...Array.from({ length: totalDaysInMonth }, (_, idx) => {
            const day = idx + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return { day, dateKey };
        })
    ];

    useEffect(() => {
        const handleOutside = (e) => {
            if (!containerRef.current?.contains(e.target)) {
                setActiveEvent(null);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <div className="meeting-calendar" ref={containerRef}>
            {/* Calendar top controls row (month label, nav buttons, view switch) */}
            <div className="meeting-calendar-toolbar">
                <div className="meeting-calendar-toolbar-left">
                    <button type="button" className="meeting-calendar-nav-btn" onClick={goPrevMonth}>
                        Prev
                    </button>
                    <label>{monthLabel}</label>
                    <button type="button" className="meeting-calendar-nav-btn" onClick={goNextMonth}>
                        Next
                    </button>
                    <button type="button" className="meeting-calendar-nav-btn" onClick={goToday}>
                        Today
                    </button>
                </div>
                <div className="meeting-calendar-toolbar-right">
                    <button type="button" className="meeting-add-event-btn" onClick={() => onAddEvent?.()}>
                        Add Event
                    </button>
                    {/* TODO: render view mode controls using viewMode/setViewMode */}
                    <button onClick={() => setViewMode(v => v === "month" ? "week" : "month")}>
                        {viewMode}
                    </button>
                </div>
            </div>

            {/* Weekday labels + day cells grid */}
            <div className="meeting-grid">
                <div className="meeting-grid-head">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                </div>

                <div className="meeting-grid-body">
                    {days.map((cell, idx) => {
                        const isToday = cell?.dateKey === todayKey;
                        return (
                        <div
                            className={`meeting-day-cell${isToday ? ' meeting-day-cell--today' : ''}`}
                            key={cell?.dateKey || `empty-${idx}`}
                            onClick={() => setActiveEvent(null)}
                        >
                            {cell ? (
                                <>
                                    <button
                                        type="button"
                                        className={`meeting-day-number${isToday ? ' meeting-day-number--today' : ''}`}
                                        onClick={(evt) => {
                                            evt.stopPropagation();
                                            onSelectDate?.(cell.dateKey);
                                        }}
                                    >
                                        {cell.day}
                                    </button>
                                    <div className="meeting-day-events">
                                        {ieps
                                            .filter((i) => toDateKey(i.meeting_time) === cell.dateKey)
                                            .slice(0, 3)
                                            .map((e) => (
                                                <div key={e.id} className="meeting-chip-wrap">
                                                    <button
                                                        type="button"
                                                        className="meeting-day-chip"
                                                        onClick={(evt) => {
                                                            evt.stopPropagation();
                                                            setActiveEvent((prev) => (prev?.id === e.id ? null : e));
                                                            onSelectEvent?.(e);
                                                        }}
                                                    >
                                                        {new Date(e.meeting_time).toLocaleTimeString([], {
                                                            hour: 'numeric',
                                                            minute: '2-digit'
                                                        })}{' '}
                                                        IEP meeting with {e.student_name || 'student'}
                                                    </button>

                                                    {activeEvent?.id === e.id ? (
                                                        <div className="meeting-event-tooltip" onClick={(evt) => evt.stopPropagation()}>
                                                            <p className="meeting-event-time">
                                                                {new Date(e.meeting_time).toLocaleTimeString([], {
                                                                    hour: 'numeric',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                            <p className="meeting-event-title">
                                                                IEP meeting with {e.student_name || 'student'}
                                                            </p>
                                                            <p className="meeting-event-meta">{e.status || 'draft'}</p>
                                                            {e.meeting_link ? (
                                                                <a
                                                                    className="meeting-event-link"
                                                                    href={e.meeting_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Join meeting link
                                                                </a>
                                                            ) : null}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))}
                                        {/* TODO: render day event chips here */}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    ); })}
                </div>
            </div>
        </div>
    );
}


// MeetingCalendarGrid component guide
// Purpose:
// - Render calendar cells for selected view mode (start with month view first).
//
// Suggested props:
// - currentDate: anchor date for visible month/week/day.
// - events: normalized meeting events list.
// - selectedDate: currently selected date.
// - onSelectDate: callback when a date cell is clicked.
// - onSelectEvent: callback when an event is clicked.
//
// Build order:
// 1) Generate visible day cells (including leading/trailing days if month view).
// 2) Group events by day key (YYYY-MM-DD).
// 3) Render each day cell with:
//    - day number
//    - small list of event chips/cards
// 4) Highlight today and selected date.
//
// Edge cases:
// - More events than fit in a cell => show "+N more".
// - Invalid event times => skip safely.
