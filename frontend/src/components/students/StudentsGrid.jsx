import { Trash2 } from 'lucide-react';

function StudentsGrid({ students, pickAvatar, formatDateOnly, onDeleteStudent }) {
  return (
    <div className="students-grid">
      {students.map((s) => (
        <article className="students-grid-card" key={s.id}>
          <div className="student-cell">
            <img className="student-avatar" src={pickAvatar(s)} alt={`${s.first_name} ${s.last_name}`} />
            <div>
              <p className="student-name">{s.first_name} {s.last_name}</p>
              <p className="student-id">{s.student_number}</p>
            </div>
          </div>
          <p><strong>School Name:</strong> {s.school_name || '-'}</p>
          <p><strong>Grade:</strong> {s.grade_level ?? '-'}</p>
          <p><strong>DOB:</strong> {formatDateOnly(s.date_of_birth)}</p>
          <p><strong>Guardian:</strong> {s.guardian_contact || '-'}</p>
          
          <div className="students-grid-card-actions">
            <button
              type="button"
              className="student-delete-btn"
              onClick={() => onDeleteStudent(s.id)}
              aria-label={`Delete ${s.first_name} ${s.last_name}`}
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default StudentsGrid;
