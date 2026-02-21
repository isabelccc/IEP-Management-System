import { useEffect, useRef, useState } from 'react';
import { addIepRecord } from '../../services/ieps.service.js';
import { getStudents } from '../../services/students.service.js';

export default function AddMeetingModal({ isOpen, onClose, onSuccess }) {
    const [studentName, setStudentName] = useState('');
    const [selectedStudent, setSelectedStudent] = useState('');
    const [students, setStudents] = useState([]);
    const [meetingTime, setMeetingTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('draft');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const firstInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        firstInputRef.current?.focus();

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    const resetForm = () => {
        setStudentName('');
        setSelectedStudent('');
        setMeetingTime('');
        setMeetingLink('');
        setStartDate('');
        setEndDate('');
        setStatus('draft');
        setError('');
    };

    const validate = () => {
        if (!studentName.trim()) return 'Student name is required';
        if (!meetingTime.trim()) return 'Meeting time is required';
        if (!['draft', 'review', 'finalized'].includes(status)) return 'Status must be draft/review/finalized';
        return '';
    };

    const handleStudentSelect = (e) => {
        const value = e.target.value;
        setSelectedStudent(value);
        if (value === 'OTHER') {
            setStudentName('');
        } else {
            setStudentName(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSubmitting(true);
            const res = await addIepRecord(
                studentName.trim(),
                startDate || null,
                endDate || null,
                meetingTime,
                meetingLink.trim() || null,
                status
            );
            onSuccess?.(res?.data);
            resetForm();
            onClose?.();
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || 'Failed to add meeting';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const loadStudents = async () => {
            try {
                const res = await getStudents();
                setStudents(Array.isArray(res?.data) ? res.data : []);
            } catch {
                setStudents([]);
            }
        };
        loadStudents();
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="add-student-modal-overlay" onClick={onClose}>
            <div className="add-student-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="add-student-modal-header">
                    <h2 className="add-student-modal-title">Add Meeting</h2>
                    <button type="button" className="add-student-modal-close" onClick={onClose} aria-label="Close">
                        X
                    </button>
                </div>

                <form className="add-student-modal-form" onSubmit={handleSubmit}>
                    <div className="add-student-field">
                        <label className="add-student-label">Student Name *</label>
                        <select
                            ref={firstInputRef}
                            className="add-student-input"
                            value={selectedStudent}
                            onChange={handleStudentSelect}
                        >
                            <option value="">Select existing student</option>
                            {students.map((s) => {
                                const fullName = `${s.first_name} ${s.last_name}`;
                                return (
                                    <option key={s.id} value={fullName}>
                                        {fullName}
                                    </option>
                                );
                            })}
                            <option value="OTHER">Add new student</option>
                        </select>
                        {selectedStudent === 'OTHER' ? (
                            <input
                                className="add-student-input"
                                type="text"
                                value={studentName}
                                onChange={(e) => setStudentName(e.target.value)}
                                placeholder="Enter new student full name"
                            />
                        ) : null}
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Meeting Time *</label>
                        <input
                            className="add-student-input"
                            type="datetime-local"
                            value={meetingTime}
                            onChange={(e) => setMeetingTime(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Meeting Link</label>
                        <input
                            className="add-student-input"
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="https://zoom.us/..."
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Start Date</label>
                        <input
                            className="add-student-input"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">End Date</label>
                        <input
                            className="add-student-input"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Status</label>
                        <select
                            className="add-student-input"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="draft">draft</option>
                            <option value="review">review</option>
                            <option value="finalized">finalized</option>
                        </select>
                    </div>

                    {error ? <p className="add-student-error">{error}</p> : null}

                    <div className="add-student-modal-actions">
                        <button type="button" className="add-student-cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="add-student-submit-btn" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


