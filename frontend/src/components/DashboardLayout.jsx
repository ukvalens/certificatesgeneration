import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

const roleMenus = {
  admin: [
    { icon: '📊', label: 'Overview', to: '/dashboard' },
    { icon: '🎓', label: 'Certificates', to: '/certificates' },
    { icon: '📋', label: 'Courses', to: '/certificate-types' },
    { icon: '🗂️', label: 'Certificate Types', to: '/categories' },
    { icon: '🔍', label: 'Verify', to: '/verify' },
  ],
  issuer: [
    { icon: '📊', label: 'Overview', to: '/dashboard' },
    { icon: '🔍', label: 'Verify', to: '/verify' },
  ],
  recipient: [
    { icon: '🎖️', label: 'My Certificates', to: '/dashboard' },
    { icon: '🔍', label: 'Verify', to: '/verify' },
  ],
};

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.matchMedia('(max-width: 900px)').matches);
  const menu = roleMenus[user?.role] || [];

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const handler = e => { setIsMobile(e.matches); if (!e.matches) setMobileOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };
  const sidebarW = isMobile ? 220 : collapsed ? 60 : 220;

  return (
    <div style={s.root}>

      {/* ── Sidebar ── */}
      <aside style={{
        ...s.sidebar,
        width: sidebarW,
        transform: isMobile && !mobileOpen ? 'translateX(-100%)' : 'translateX(0)',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 1000 : 1,
      }}>
        <div style={s.sidebarTop}>
          {!collapsed && <span style={s.logo}>🎓 CertSystem</span>}
          {collapsed && <span style={s.logoIcon}>🎓</span>}
          {!isMobile && (
            <button onClick={() => setCollapsed(c => !c)} style={s.collapseBtn}>
              {collapsed ? '→' : '←'}
            </button>
          )}
        </div>

        <nav style={s.nav}>
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={() => isMobile && setMobileOpen(false)}
              style={({ isActive }) => ({ ...s.navItem, ...(isActive ? s.navActive : {}) })}
            >
              <span style={s.navIcon}>{item.icon}</span>
              {!collapsed && <span style={s.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div style={s.sidebarFooter}>
            <span style={s.roleTag}>{user?.role?.toUpperCase()}</span>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div style={s.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Main column ── */}
      <div style={s.main}>

        {/* Topbar */}
        <header style={s.topbar}>
          {isMobile && (
            <button onClick={() => setMobileOpen(o => !o)} style={s.menuBtn}>
              <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </button>
          )}
          <div style={s.greeting}>
            <span style={s.greetName}>👋 Hello, {user?.name}</span>
            <span style={s.greetDate}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <div style={s.topRight}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={s.userInfo}>
              <span style={s.userName}>{user?.name}</span>
              <span style={s.userEmail}>{user?.email}</span>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn}>Logout</button>
          </div>
        </header>

        {/* Scrollable body */}
        <main style={s.body}>
          {title && <h1 style={s.pageTitle}>{title}</h1>}
          {children}
        </main>

        {/* Footer — always at bottom */}
        <footer style={s.footer}>
          <div style={s.footerInner}>
            <span style={s.footerBrand}>🎓 CertSystem</span>
            <span style={s.footerText}>
              Need a certificate? <a href="mailto:ukwitegetsev9@gmail.com" style={s.footerLink}>support@certsystem.com</a>
            </span>
            <span style={s.footerCopy}>© {new Date().getFullYear()} CertSystem</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

const s = {
  root: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: colors.light,
  },
  sidebar: {
    background: colors.primary,
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    height: '100vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    transition: 'width 0.2s ease, transform 0.2s ease',
    top: 0,
    left: 0,
  },
  sidebarTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 12px 14px',
    borderBottom: `1px solid rgba(255,255,255,0.1)`,
    flexShrink: 0,
  },
  logo: { color: '#fff', fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap' },
  logoIcon: { color: '#fff', fontSize: 20 },
  collapseBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    borderRadius: 4,
    cursor: 'pointer',
    padding: '3px 8px',
    fontSize: 12,
    flexShrink: 0,
  },
  nav: { flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.8)',
    textDecoration: 'none',
    fontSize: 14,
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
  },
  navActive: { background: colors.secondary, color: '#fff' },
  navIcon: { fontSize: 17, flexShrink: 0 },
  navLabel: { overflow: 'hidden', textOverflow: 'ellipsis' },
  sidebarFooter: {
    padding: '12px 16px',
    borderTop: `1px solid rgba(255,255,255,0.1)`,
    flexShrink: 0,
  },
  roleTag: {
    background: colors.secondary,
    color: '#fff',
    fontSize: 10,
    padding: '3px 10px',
    borderRadius: 20,
    fontWeight: 700,
    letterSpacing: 1,
  },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 900 },

  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    height: '100vh',
    overflow: 'hidden',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 24px',
    height: 64,
    minHeight: 64,
    flexShrink: 0,
    background: colors.surface,
    boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
    flexWrap: 'wrap',
  },
  menuBtn: {
    background: 'transparent',
    border: `1px solid ${colors.border}22`,
    borderRadius: 8,
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: colors.dark,
    fontSize: 16,
    flexShrink: 0,
  },
  greeting: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 },
  greetName: { fontSize: 15, fontWeight: 600, color: colors.dark, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  greetDate: { fontSize: 12, color: colors.muted },
  topRight: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: colors.primary,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  userInfo: { display: 'flex', flexDirection: 'column', lineHeight: 1.3 },
  userName: { fontSize: 13, fontWeight: 600, color: colors.dark },
  userEmail: { fontSize: 11, color: colors.muted },
  logoutBtn: {
    background: `${colors.secondary}18`,
    color: colors.secondary,
    border: 'none',
    padding: '7px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },

  body: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 28px',
    background: colors.light,
  },
  pageTitle: { fontSize: 22, color: colors.dark, marginBottom: 20, fontWeight: 700 },

  footer: {
    flexShrink: 0,
    background: colors.primary,
    padding: '12px 24px',
  },
  footerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '100%',
  },
  footerBrand: { color: '#fff', fontWeight: 700, fontSize: 14 },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  footerLink: { color: '#fff', textDecoration: 'underline', marginLeft: 4 },
  footerCopy: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
};
