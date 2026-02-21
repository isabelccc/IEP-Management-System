import { Trash2 } from 'lucide-react';

function StudentsTable({ students, pickAvatar, formatDateOnly, onDeleteStudent }) {
  return (
    <div className="students-table-wrap">
      <table className="students-table">
        <thead>
          <tr>
            <th>Student #</th>
            <th>Name</th>
            <th>Grade</th>
            <th>School</th>
            <th>Date of Birth</th>
            <th>Guardian Contact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.student_number}</td>
              <td>
                <div className="student-cell">
                  <img className="student-avatar" src={pickAvatar(s)} alt={`${s.first_name} ${s.last_name}`} />
                  <span>{s.first_name} {s.last_name}</span>
                </div>
              </td>
              <td>{s.grade_level}</td>
              <td>{s.school_name}</td>
              <td>{formatDateOnly(s.date_of_birth)}</td>
              <td>{s.guardian_contact}</td>
              <td>
                <button
                  type="button"
                  className="student-delete-btn"
                  onClick={() => onDeleteStudent(s.id)}
                  aria-label={`Delete ${s.first_name} ${s.last_name}`}
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentsTable;
