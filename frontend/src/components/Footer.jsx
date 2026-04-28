import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brand}>
          <i className="fa-solid fa-graduation-cap" style={{ marginRight: 8 }}></i>
          CertSystem
        </div>
        <div style={styles.links}>
          <Link to="/" style={styles.link}><i className="fa-solid fa-house" style={{ marginRight: 5 }}></i>Home</Link>
          <Link to="/verify" style={styles.link}><i className="fa-solid fa-magnifying-glass" style={{ marginRight: 5 }}></i>Verify</Link>
          <Link to="/login" style={styles.link}><i className="fa-solid fa-right-to-bracket" style={{ marginRight: 5 }}></i>Login</Link>
          <Link to="/register" style={styles.link}><i className="fa-solid fa-user-plus" style={{ marginRight: 5 }}></i>Register</Link>
        </div>
        <div style={styles.copy}>
          <i className="fa-regular fa-copyright" style={{ marginRight: 5 }}></i>
          {new Date().getFullYear()} CertSystem. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#1e3a8a', color: '#cbd5e1', padding: '20px 32px' },
  inner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 1100, margin: '0 auto' },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  links: { display: 'flex', gap: 20 },
  link: { color: '#cbd5e1', textDecoration: 'none', fontSize: 13 },
  copy: { fontSize: 13 },
};
