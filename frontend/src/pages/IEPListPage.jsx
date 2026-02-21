import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIeps } from '../services/ieps.service';
import NavigationBar from '../components/dashboard/NavigationBar';

function IEPListPage() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ieps, setIeps] = useState([]);

    const statusFilter = (searchParams.get('status') || '').trim().toLowerCase();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    useEffect(() => {
        if (!user) return;

        const loadIeps = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await getAllIeps();
                const list = Array.isArray(res?.data) ? res.data : [];
                setIeps(list);
            } catch (err) {
                const message = err?.response?.data?.error || err?.message || 'Failed to load IEP events';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        loadIeps();
    }, [user]);

    const filteredIeps = useMemo(() => {
        if (!statusFilter) return ieps;
        return ieps.filter((i) => String(i.status || '').toLowerCase() === statusFilter);
    }, [ieps, statusFilter]);

    const formatMeetingTime = (value) => {
        if (!value) return '-';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        return d.toLocaleString();
    };

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-shell">
            <NavigationBar onLogout={handleLogout} />
            <div className="iep-list-page">
                <div className="iep-list-header">
                    <div>
                        <h1 className="iep-list-title">IEP Events</h1>
                        <p className="iep-list-subtitle">
                            {filteredIeps.length} result(s){statusFilter ? ` - status: ${statusFilter}` : ''}
                        </p>
                    </div>
                </div>

                {loading ? <p>Loading IEP events...</p> : null}
                {error ? <p role="alert">{error}</p> : null}

                {!loading && !error ? (
                    filteredIeps.length > 0 ? (
                        <div className="iep-list-grid">
                            {filteredIeps.map((e) => (
                                <article key={e.id} className="iep-list-card">
                                    <p className="iep-list-time">{formatMeetingTime(e.meeting_time)}</p>
                                    <h3 className="iep-list-card-title">
                                        IEP meeting with {e.student_name || `Student #${e.student_id}`}
                                    </h3>
                                    <p className="iep-list-status">Status: {e.status || '-'}</p>
                                    {e.meeting_link ? (
                                        <a
                                            className="iep-list-link"
                                            href={e.meeting_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Join meeting link
                                        </a>
                                    ) : null}
                                </article>
                            ))}
                        </div>
                    ) : (
                        <p>No IEP events found.</p>
                    )
                ) : null}
            </div>
        </div>
    );
}

export default IEPListPage;