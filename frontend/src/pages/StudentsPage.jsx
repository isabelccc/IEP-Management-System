
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { deleteStudentById, getStudents } from '../services/students.service';
import avatar1 from '../assets/avatar1.png';
import avatar2 from '../assets/avatar2.png';
import avatar3 from '../assets/avatar3.png';
import avatar4 from '../assets/avatar4.png';
import avatar5 from '../assets/avatar5.png';
import avatar6 from '../assets/avatar6.png';
import avatar7 from '../assets/avatar7.png';
import StudentsToolbar from '../components/students/StudentsToolbar';
import StudentsTable from '../components/students/StudentsTable';
import StudentsGrid from '../components/students/StudentsGrid';
import AddStudentModal from '../components/students/AddStudentModal';
import {getAllSchools} from '../services/school.service'
import NavigationBar from '../components/dashboard/NavigationBar'

function StudentsPage() {

    const { user,signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [students, setStudents] = useState([]);
    const [filter, setFilter] = useState('');
    const [view, setView] = useState("list"); // "grid" | "list"
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [schoolNames, setSchoolNames] = useState([])

    const avatarPool = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7];
    const handleLogout = async () => {
        await signOut();
        navigate('/login');

    };
    useEffect(() => {
        if (!user) return;

        const loadStudentsdata = async () => {
            try {
                setLoading(true);
                setError('');

                const studentsRes = await getStudents();
                const studentList = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
                setStudents(studentList);


            } catch (err) {
                const message = err?.response?.data?.error || err?.message || 'Failed to load dashboard data';
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        const loadSchooldata = async()=>{
            try{
                setLoading(true);
                setError('');
                const schoolData = await getAllSchools();
                setSchoolNames(schoolData.data.map(s=>s.name));

            }catch(err){
                const message = err?.response?.data?.error || err?.message || 'Failed to load dashboard data';
                setError(message);

            }
            finally {
                setLoading(false);
            }
        }


        loadStudentsdata();
        loadSchooldata();
    }, [user]);

    function handleViewToggle() {
        if (view === 'grid') {
            setView('list')
        }
        else {
            setView('grid')
        }

    }

    function handleFilterChange(e) {
        setFilter(e.target.value);
    }

    function handleOpenAddModal() {
        setSuccess('');
        setIsAddModalOpen(true);
    }

    function handleCloseAddModal() {
        setIsAddModalOpen(false);
        if (location.pathname === '/students/new' || searchParams.get('openAdd') === '1' || searchParams.get('openAddStudents') === '1') {
            navigate('/students', { replace: true });
        }
    }

    useEffect(() => {
        if (location.pathname === '/students/new' || searchParams.get('openAdd') === '1' || searchParams.get('openAddStudents') === '1') {
            handleOpenAddModal();
        }
    }, [location.pathname, searchParams]);

    function handleStudentAdded(createdStudent) {
        if (!createdStudent) return;
        setStudents((prev) => {
            if (prev.some((s) => s.id === createdStudent.id)) return prev;
            return [createdStudent, ...prev];
        });
        setSuccess('Student added successfully.');
    }

    async function handleDeleteStudent(studentId) {
        const confirmed = window.confirm('Delete this student record?');
        if (!confirmed) return;
        setError('');
        setSuccess('');
        const previous = students;
        setStudents((prev) => prev.filter((s) => s.id !== studentId));
        try {
            await deleteStudentById(studentId);
        } catch (err) {
            setStudents(previous);
            const message = err?.response?.data?.error || err?.message || 'Deletion for database failed';
            setError(message);
        }
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const filteredStudents = students.filter((s) => {
        if (!filter) return true;
        const grade = String(s.grade_level ?? '');
        return grade === filter;
    });

    const formatDateOnly = (dateValue) => {
        if (!dateValue) return '-';
        const d = new Date(dateValue);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('en-CA');
    };

    const pickAvatar = (student) => {
        const base = student?.id ?? student?.student_number ?? '';
        const text = String(base);
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = (hash + text.charCodeAt(i)) % avatarPool.length;
        }
        return avatarPool[hash];
    };

    return (
        <div className='app-shell'>
        <NavigationBar onLogout={handleLogout} />
        <div className="students-page">
            <div className="students-header">
                <div>
                    <h1 className="students-title">Students</h1>
                    <p className="students-subtitle">{filteredStudents.length} results</p>
                </div>
            </div>
            <StudentsToolbar
                filter={filter}
                onFilterChange={handleFilterChange}
                view={view}
                onToggleView={handleViewToggle}
                onAddStudent={handleOpenAddModal}
            />

            {loading ? <p>Loading students...</p> : null}
            {error ? <p role="alert">{error}</p> : null}
            {success ? <p role="status">{success}</p> : null}

            {view === 'list' ? (
                <StudentsTable
                    students={filteredStudents}
                    pickAvatar={pickAvatar}
                    formatDateOnly={formatDateOnly}
                    onDeleteStudent={handleDeleteStudent}
                    onOpenStudent={(studentId) => navigate(`/students/${studentId}`)}
                />
            ) : (
                <StudentsGrid
                    students={filteredStudents}
                    pickAvatar={pickAvatar}
                    formatDateOnly={formatDateOnly}
                    onDeleteStudent={handleDeleteStudent}
                    onOpenStudent={(studentId) => navigate(`/students/${studentId}`)}
                />
            )}

            <AddStudentModal
                isOpen={isAddModalOpen}
                onClose={handleCloseAddModal}
                onSuccess={handleStudentAdded}
                schools={schoolNames}
            />
        </div></div>

    )

}

export default StudentsPage;