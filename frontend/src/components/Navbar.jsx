import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleLogout = () => { logout(); navigate('/'); setMenuOpen(false); };
  const close = () => setMenuOpen(false);

  return (
    <nav className="navbar" style={styles.nav}>
      <div style={styles.navTop}>
        <Link to="/" style={styles.brand} onClick={close}>{brand}</Link>
        {/* Always show login/register on mobile top bar for non-logged-in users */}
        {!user && (
          <div className="nav-auth-mobile" style={styles.authMobile}>
            <Link to="/login" onClick={close} style={styles.loginMobileBtn}><i className="fa-solid fa-right-to-bracket" style={{ marginRight: 5 }}></i>Login</Link>
            <Link to="/register" onClick={close} style={styles.registerMobileBtn}><i className="fa-solid fa-user-plus" style={{ marginRight: 5 }}></i>Register</Link>
          </div>
        )}
        <button className="nav-hamburger" style={styles.hamburger} onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
        </button>
      </div>
      <div className={`nav-collapse${menuOpen ? ' open' : ''}`}>
        <div className="nav-links" style={styles.links}>
          {links.map(l => (
            <Link key={l.to} to={l.to} onClick={close} style={{ ...styles.link, ...(pathname === l.to ? styles.active : {}) }}>
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
              <Link to="/login" onClick={close} style={styles.link}><i className="fa-solid fa-right-to-bracket" style={{ marginRight: 6 }}></i>Login</Link>
              <Link to="/register" onClick={close} style={styles.registerBtn}><i className="fa-solid fa-user-plus" style={{ marginRight: 6 }}></i>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: colors.primary, padding: '0 24px', position: 'relative' },
  navTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 },
  brand: { color: colors.surface, fontWeight: 'bold', fontSize: 20, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 },
  authMobile: { display: 'none', alignItems: 'center', gap: 8, marginLeft: 'auto', marginRight: 8 },
  loginMobileBtn: { color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 13, whiteSpace: 'nowrap' },
  registerMobileBtn: { background: colors.surface, color: colors.primary, textDecoration: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap' },
  hamburger: { display: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: colors.surface, borderRadius: 6, width: 38, height: 38, cursor: 'pointer', fontSize: 16, alignItems: 'center', justifyContent: 'center' },
  links: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  right: { display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexWrap: 'wrap' },
  link: { color: 'rgba(255,255,255,0.8)', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, whiteSpace: 'nowrap' },
  active: { background: colors.secondary, color: colors.surface },
  registerBtn: { background: colors.surface, color: colors.primary, textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 14, fontWeight: 'bold' },
  logoutBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  userInfo: { color: 'rgba(255,255,255,0.85)', fontSize: 13, whiteSpace: 'nowrap' },
  roleBadge: { background: colors.secondary, color: colors.surface, padding: '2px 8px', borderRadius: 10, fontSize: 11, marginLeft: 4 },
};
