import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const emailParam = searchParams.get('email') || '';
    const tokenParam = searchParams.get('token') || '';
    setEmail(emailParam);
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email.trim() || !token || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword({ email: email.trim(), token, password });
      setMessage(res.data.message || 'Your password has been reset successfully.');
      setError('');
      logout();
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={styles.page}>
      <div className="auth-box" style={styles.box}>
        <h1 style={styles.title}>🔒 Choose a New Password</h1>
        <p style={styles.sub}>Enter a new password for your account.</p>
        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <p style={styles.link}>Remembered your password? <Link to="/login">Sign In</Link></p>
        <p style={styles.link}><Link to="/">Back to Home</Link></p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.light, padding: 24 },
  box: { background: colors.surface, borderRadius: 12, padding: 40, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', width: '100%', maxWidth: 420 },
  title: { fontSize: 24, color: colors.dark, marginBottom: 4, textAlign: 'center' },
  sub: { color: colors.muted, textAlign: 'center', marginBottom: 24, fontSize: 14 },
  error: { background: 'rgba(228, 58, 25, 0.12)', color: colors.secondary, padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  success: { background: 'rgba(40, 167, 69, 0.12)', color: '#1b6f35', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  input: { width: '100%', padding: '12px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', color: colors.dark },
  btn: { width: '100%', background: colors.primary, color: colors.surface, border: 'none', padding: '12px', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, fontSize: 14, color: colors.muted },
};
