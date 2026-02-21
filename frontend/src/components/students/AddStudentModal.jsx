import { useEffect, useRef, useState } from 'react';
import { AddStudent } from '../../services/students.service';

export default function AddStudentModal({ isOpen, onClose, onSuccess, schools }) {
    const [schoolName, setSchoolName] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [guardian, setGuardian] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const firstInputRef = useRef(null);
    const [selectedSchool, setSelectedSchool]= useState('')
    
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
        setSchoolName('');
        setStudentNumber('');
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
        setGradeLevel('');
        setGuardian('');
        setError('');
    };

    const validate = () => {
        if (!schoolName.trim()) return 'School Name is required';
        if (!studentNumber.trim()) return 'Student number is required';
        if (!firstName.trim()) return 'First name is required';
        if (!lastName.trim()) return 'Last name is required';
        if (gradeLevel && Number.isNaN(Number(gradeLevel))) return 'Grade level must be numeric';
        return '';
    };

    const handleSelect = (e)=>{
        setSelectedSchool(e.target.value);
        if(e.target.value === "OTHER"){
            setSchoolName('')
        }
        else{
            setSchoolName(e.target.value)
        }
        
    }

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
            const res = await AddStudent(
                schoolName,
                studentNumber.trim(),
                firstName.trim(),
                lastName.trim(),
                dateOfBirth || null,
                gradeLevel ? Number(gradeLevel) : null,
                guardian.trim() || null
            );
            const createdStudent = res?.data;
            onSuccess?.(createdStudent);
            resetForm();
            onClose?.();
        } catch (err) {
            const message = err?.response?.data?.error || err?.message || 'Failed to add student';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="add-student-modal-overlay" onClick={onClose}>
            <div className="add-student-modal-card" onClick={(e) => e.stopPropagation()}>
                <div className="add-student-modal-header">
                    <h2 className="add-student-modal-title">Add Student</h2>
                    <button type="button" className="add-student-modal-close" onClick={onClose} aria-label="Close">
                        X
                    </button>
                </div>

                <form className="add-student-modal-form" onSubmit={handleSubmit}>


                    <div className="add-student-field">
                        <label className="add-student-label">Student Number *</label>
                        <input
                            className="add-student-input"
                            type="text"
                            value={studentNumber}
                            onChange={(e) => setStudentNumber(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">First Name *</label>
                        <input
                            className="add-student-input"
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Last Name *</label>
                        <input
                            className="add-student-input"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />
                    </div>
                    <div className="add-student-field">
                        <label className="add-student-label">School Name</label>
                        <select className = "add-student-input" onChange = {handleSelect} value = {selectedSchool}>
                            <option value="">Select school</option>
                            {schools.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                            <option value="OTHER">OTHER</option>
                        </select>
                        {selectedSchool === 'OTHER' &&
                        <input
                            ref={firstInputRef}
                            className="add-student-input"
                            type="text"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                        />
                    }
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Date of Birth</label>
                        <input
                            className="add-student-input"
                            type="date"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Grade Level</label>
                        <input
                            className="add-student-input"
                            type="number"
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(e.target.value)}
                        />
                    </div>

                    <div className="add-student-field">
                        <label className="add-student-label">Guardian Contact</label>
                        <input
                            className="add-student-input"
                            type="text"
                            value={guardian}
                            onChange={(e) => setGuardian(e.target.value)}
                        />
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


