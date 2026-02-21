import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'

function LoginPage() {
    // HINT: add an `error` state so validation/API errors can be shown in UI.
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault()
        setError('');
        setSubmitting(true);
        try {
            if (!email.trim() || !password.trim()) {
                setError('Email or password is not given')
                return;
            }
            const result = await signIn(email, password);
            if (!result.ok) {
                const apiMessage =
                    result.error?.response?.data?.error || result.error?.message || 'Login failed';

                setError(apiMessage);
                return;
            }
            navigate('/dashboard');
        }
        catch (err) {
            console.error(err)
            setError('Unexpected error during login');
        } finally {
            setSubmitting(false);
        }

    }
    return (
        <div className='login'>
            <div className="login-card">
            <h1 className="login-title">Sign in</h1>
            <p className="login-subtitle">Access your IEP management workspace</p>
            {error ? <p role="alert" className="login-error">{error}</p> : null}

            <form className='login-form' onSubmit={handleSubmit}>
                <label htmlFor="email">Email</label>
                <input
                    className="login-input"
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}>
                </input>
                <label htmlFor="password">Password</label>
                <input
                    className="login-input"
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                >
                </input>
                <button className="login-button" type="submit" disabled={submitting}>
                    {submitting ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
            </div>
        </div>
    )
}
export default LoginPage

