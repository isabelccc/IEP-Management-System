// MeetingCalendarHeader component guide
// Purpose:
// - Top controls for the meeting calendar page.
//
// Suggested props:
// - currentDate: currently focused date.
// - viewMode: "month" | "week" | "day".
// - onPrev: go to previous period.
// - onNext: go to next period.
// - onToday: jump to today.
// - onViewChange: switch between Month/Week/Day.
//
// UI sections:
// - Left: title + current range label.
// - Right: navigation arrows + Today + segmented view-mode buttons.
//
// Behavior:
// - Disable active view button.
// - Keep controls keyboard-accessible.
// - Use aria-labels for nav buttons.
