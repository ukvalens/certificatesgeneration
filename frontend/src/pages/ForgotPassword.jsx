import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api';
import { colors } from '../theme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      setMessage('');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await forgotPassword({ email: email.trim() });
      setMessage(res.data.message || 'Password reset link has been sent. Please check your inbox.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send reset link. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center" style={styles.page}>
      <div className="auth-box" style={styles.box}>
        <h1 style={styles.title}>🔑 Reset Password</h1>
        <p style={styles.sub}>Enter your email to receive a password reset link.</p>
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
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
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
