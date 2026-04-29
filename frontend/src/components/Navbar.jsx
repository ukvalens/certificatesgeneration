import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const brand = <><i className="fa-solid fa-graduation-cap" style={{ marginRight: 8 }}></i>CertSystem</>;

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge' },
    { to: '/certificates', label: 'Certificates', icon: 'fa-certificate' },
    { to: '/certificate-types', label: 'Types', icon: 'fa-list' },
    { to: '/categories', label: 'Categories', icon: 'fa-folder-tree' },
    { to: '/verify', label: 'Verify', icon: 'fa-magnifying-glass' },
  ];

  const issuerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: 'fa-gauge' },
    { to: '/verify', label: 'Verify', icon: 'fa-magnifying-glass' },
  ];

  const recipientLinks = [
    { to: '/dashboard', label: 'My Certificates', icon: 'fa-medal' },
    { to: '/verify', label: 'Verify', icon: 'fa-magnifying-glass' },
  ];

  const publicLinks = [
    { to: '/', label: 'Home', icon: 'fa-house' },
    { to: '/verify', label: 'Verify', icon: 'fa-magnifying-glass' },
  ];

  const links = !user ? publicLinks
    : user.role === 'admin' ? adminLinks
    : user.role === 'issuer' ? issuerLinks
    : recipientLinks;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className="navbar" style={styles.nav}>
      <Link to="/" style={styles.brand}>{brand}</Link>
      <div className="nav-links" style={styles.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ ...styles.link, ...(pathname === l.to ? styles.active : {}) }}>
            <i className={`fa-solid ${l.icon}`} style={{ marginRight: 6 }}></i>{l.label}
          </Link>
        ))}
      </div>
      <div className="navbar-right" style={styles.right}>
        {user ? (
          <>
            <span style={styles.userInfo}>{user.name} <span style={styles.roleBadge}>{user.role}</span></span>
            <button onClick={handleLogout} style={styles.logoutBtn}><i className="fa-solid fa-right-from-bracket" style={{ marginRight: 6 }}></i>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}><i className="fa-solid fa-right-to-bracket" style={{ marginRight: 6 }}></i>Login</Link>
            <Link to="/register" style={styles.registerBtn}><i className="fa-solid fa-user-plus" style={{ marginRight: 6 }}></i>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: colors.primary, padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  brand: { color: colors.surface, fontWeight: 'bold', fontSize: 20, textDecoration: 'none', marginRight: 24, whiteSpace: 'nowrap', flexShrink: 0 },
  links: { display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap', minWidth: 0 },
  right: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' },
  link: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, whiteSpace: 'nowrap' },
  active: { background: colors.secondary, color: colors.surface },
  registerBtn: { background: colors.surface, color: colors.primary, textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 'bold' },
  logoutBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  userInfo: { color: 'rgba(255,255,255,0.85)', fontSize: 13, whiteSpace: 'nowrap' },
  roleBadge: { background: colors.secondary, color: colors.surface, padding: '2px 8px', borderRadius: 10, fontSize: 11, marginLeft: 4 },
};
