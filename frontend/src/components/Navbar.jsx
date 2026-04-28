import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/certificates', label: 'Certificates' },
    { to: '/certificate-types', label: 'Certificate Types' },
    { to: '/categories', label: 'Categories' },
    { to: '/verify', label: 'Verify' },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>🎓 CertSystem</div>
      <div style={styles.links}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{ ...styles.link, ...(pathname === l.to ? styles.active : {}) }}>
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const styles = {
  nav: { background: '#1e3a8a', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60 },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: 20, marginRight: 40 },
  links: { display: 'flex', gap: 8 },
  link: { color: '#cbd5e1', textDecoration: 'none', padding: '6px 14px', borderRadius: 6, fontSize: 14 },
  active: { background: '#2563eb', color: '#fff' },
};
