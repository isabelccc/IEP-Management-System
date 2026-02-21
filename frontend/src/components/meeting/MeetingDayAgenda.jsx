// MeetingDayAgenda component guide
// Purpose:
// - Right-side panel listing all meetings for the selected day.
//
// Suggested props:
// - selectedDate: date currently focused in calendar.
// - dayEvents: events that belong to selectedDate.
// - onSelectEvent: open event details.
//
// UI sections:
// - Header: formatted selected date + total meetings count.
// - Body: sorted timeline list by start time.
// - Footer (optional): quick action button (Schedule meeting).
//
// Behavior:
// - Sort events ascending by meeting_time.
// - Show empty state when no events:
//   "No meetings scheduled for this day."
// - Clicking an event should pass event id/object to parent.
