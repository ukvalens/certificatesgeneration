import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/certificate-types', label: 'Types' },
    { to: '/categories', label: 'Categories' },
    { to: '/verify', label: 'Verify' },
  ];

  const issuerLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/verify', label: 'Verify' },
  ];

  const recipientLinks = [
    { to: '/dashboard', label: 'My Certificates' },
    { to: '/verify', label: 'Verify' },
  ];

  const publicLinks = [
    { to: '/', label: 'Home' },
    { to: '/verify', label: 'Verify' },
  ];

  const links = !user ? publicLinks
    : user.role === 'admin' ? adminLinks
    : user.role === 'issuer' ? issuerLinks
    : recipientLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>🎓 CertSystem</Link>
      <div style={styles.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ ...styles.link, ...(pathname === l.to ? styles.active : {}) }}>
            {l.label}
          </Link>
        ))}
      </div>
      <div style={styles.right}>
        {user ? (
          <>
            <span style={styles.userInfo}>{user.name} <span style={styles.roleBadge}>{user.role}</span></span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#1e3a8a', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60, gap: 16 },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: 20, textDecoration: 'none', marginRight: 24, whiteSpace: 'nowrap' },
  links: { display: 'flex', gap: 4, flex: 1 },
  right: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' },
  link: { color: '#cbd5e1', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, whiteSpace: 'nowrap' },
  active: { background: '#2563eb', color: '#fff' },
  registerBtn: { background: '#fff', color: '#1e3a8a', textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 'bold' },
  logoutBtn: { background: '#dc2626', color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  userInfo: { color: '#cbd5e1', fontSize: 13, whiteSpace: 'nowrap' },
  roleBadge: { background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11, marginLeft: 4 },
};
