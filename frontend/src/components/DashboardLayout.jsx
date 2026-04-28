import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';
import { colors } from '../theme';

const roleMenus = {
  admin: [
    { icon: '📊', label: 'Overview', to: '/dashboard' },
    { icon: '🎓', label: 'Certificates', to: '/certificates' },
    { icon: '📋', label: 'Certificate Types', to: '/certificate-types' },
    { icon: '🗂️', label: 'Categories', to: '/categories' },
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
  const menu = roleMenus[user?.role] || [];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dashboard-root" style={styles.root}>
      {/* Sidebar */}
      <aside className="dashboard-sidebar" style={{ ...styles.sidebar, width: collapsed ? 64 : 220 }}>
        <div style={styles.sidebarTop}>
          <span style={styles.logo}>{collapsed ? '🎓' : '🎓 CertSystem'}</span>
          <button onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>{collapsed ? '→' : '←'}</button>
        </div>
        <nav style={styles.nav}>
          {menu.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navActive : {}) })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        {!collapsed && (
          <div style={styles.sidebarFooter}>
            <div style={styles.roleTag}>{user?.role?.toUpperCase()}</div>
          </div>
        )}
      </aside>

      {/* Main area */}
      <div style={styles.main}>
        {/* Topbar */}
        <header className="dashboard-topbar" style={styles.topbar}>
          <div>
            <span style={styles.greeting}>👋 Hello, {user?.name}</span>
            <span style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="dashboard-top-right" style={styles.topRight}>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name}</span>
              <span style={styles.userEmail}>{user?.email}</span>
            </div>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        </header>

        {/* Body */}
        <main className="dashboard-body" style={styles.body}>
          {title && <h1 style={styles.pageTitle}>{title}</h1>}
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}

const styles = {
  root: { display: 'flex', minHeight: '100vh', background: colors.light },
  sidebar: { background: colors.primary, display: 'flex', flexDirection: 'column', transition: 'width 0.2s', flexShrink: 0, position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' },
  sidebarTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 12px 16px', borderBottom: `1px solid ${colors.secondary}` },
  logo: { color: colors.surface, fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden' },
  collapseBtn: { background: colors.secondary, border: 'none', color: colors.surface, borderRadius: 4, cursor: 'pointer', padding: '2px 8px', fontSize: 13 },
  nav: { flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: 14, transition: 'background 0.15s' },
  navActive: { background: colors.secondary, color: colors.surface },
  navIcon: { fontSize: 18, flexShrink: 0 },
  sidebarFooter: { padding: '12px 16px', borderTop: `1px solid ${colors.secondary}` },
  roleTag: { background: colors.secondary, color: colors.surface, fontSize: 11, padding: '4px 10px', borderRadius: 20, display: 'inline-block', fontWeight: 'bold' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topbar: { background: colors.surface, padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', flexShrink: 0 },
  greeting: { fontSize: 16, fontWeight: 600, color: colors.dark, marginRight: 16 },
  date: { fontSize: 13, color: colors.muted },
  topRight: { display: 'flex', alignItems: 'center', gap: 12 },
  avatar: { width: 38, height: 38, borderRadius: '50%', background: colors.primary, color: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, flexShrink: 0 },
  userInfo: { display: 'flex', flexDirection: 'column' },
  userName: { fontSize: 14, fontWeight: 600, color: colors.dark },
  userEmail: { fontSize: 12, color: colors.muted },
  logoutBtn: { background: `${colors.secondary}22`, color: colors.secondary, border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 },
  body: { flex: 1, padding: 28, overflowY: 'auto' },
  pageTitle: { fontSize: 24, color: colors.dark, marginBottom: 24, fontWeight: 700 },
};
