import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import NavigationBar from '../components/dashboard/NavigationBar';
import { useAuth } from '../context/AuthContext';
import { getStudentById } from '../services/students.service';

function StudentDetailPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [student, setStudent] = useState(null);

  useEffect(() => {
    if (!user || !id) return;

    const loadStudent = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await getStudentById(id);
        setStudent(res?.data || null);
      } catch (err) {
        const message = err?.response?.data?.error || err?.message || 'Failed to load student details';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [user, id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDateOnly = (dateValue) => {
    if (!dateValue) return '-';
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('en-CA');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <NavigationBar onLogout={handleLogout} />
      <div className="students-page student-detail-page">
        <div className="student-detail-topbar">
          <button type="button" className="student-detail-back-btn" onClick={() => navigate('/students')}>
            Back to Students
          </button>
          <div>
            <h1 className="students-title">Student Detail</h1>
            <p className="students-subtitle">Student profile and school information</p>
          </div>
        </div>

        {loading ? <p>Loading student details...</p> : null}
        {error ? <p role="alert">{error}</p> : null}

        {!loading && !error && student ? (
          <>
            <section className="student-detail-hero">
              <h2 className="student-detail-name">
                {student.first_name} {student.last_name}
              </h2>
              <div className="student-detail-tags">
                <span className="student-detail-tag">Student #: {student.student_number || '-'}</span>
                <span className="student-detail-tag">Grade: {student.grade_level ?? '-'}</span>
                <span className="student-detail-tag">DOB: {formatDateOnly(student.date_of_birth)}</span>
              </div>
            </section>

            <div className="student-detail-sections">
              <section className="student-detail-card">
                <h3 className="student-detail-card-title">Student Contact</h3>
                <div className="student-detail-grid">
                  <p><strong>Guardian Contact:</strong> {student.guardian_contact || '-'}</p>
                </div>
              </section>

              <section className="student-detail-card">
                <h3 className="student-detail-card-title">School Information</h3>
                <div className="student-detail-grid">
                  <p><strong>School:</strong> {student.school_name || '-'}</p>
                  <p><strong>District:</strong> {student.school_district_name || '-'}</p>
                  <p><strong>School Phone:</strong> {student.school_phone || '-'}</p>
                  <p><strong>School Address:</strong> {student.school_address || '-'}</p>
                </div>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default StudentDetailPage;
