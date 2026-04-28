import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>🎓 Welcome Back</h1>
        <p style={styles.sub}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          <button style={styles.btn} type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
        <p style={styles.link}>Don't have an account? <Link to="/register">Register</Link></p>
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
  input: { width: '100%', padding: '12px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', color: colors.dark },
  btn: { width: '100%', background: colors.primary, color: colors.surface, border: 'none', padding: '12px', borderRadius: 6, fontSize: 15, cursor: 'pointer', fontWeight: 'bold' },
  link: { textAlign: 'center', marginTop: 16, fontSize: 14, color: colors.muted },
};
