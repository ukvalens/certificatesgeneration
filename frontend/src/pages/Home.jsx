import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Dynamic Certificate Generation & Verification System</h1>
          <p style={styles.heroSub}>Issue, manage, and verify digital certificates with ease. Powered by PERN Stack.</p>
          <div style={styles.heroBtns}>
            {user ? (
              <Link to="/dashboard" style={styles.btnPrimary}>Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" style={styles.btnPrimary}>Get Started</Link>
                <Link to="/verify" style={styles.btnOutline}>Verify Certificate</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Features</h2>
        <div style={styles.grid}>
          {[
            { icon: '🎓', title: 'Issue Certificates', desc: 'Dynamically generate certificates with custom types and categories.' },
            { icon: '🔍', title: 'Verify Instantly', desc: 'Verify any certificate using a unique code or QR scan.' },
            { icon: '📄', title: 'PDF Download', desc: 'Download beautifully styled certificates as PDF files.' },
            { icon: '🗂️', title: 'Manage Categories', desc: 'Organize certificates by AI, Networking, Cloud, and more.' },
            { icon: '👥', title: 'Role-Based Access', desc: 'Admin, Issuer, and Recipient roles with tailored dashboards.' },
            { icon: '🔒', title: 'Secure & Scalable', desc: 'JWT authentication and PostgreSQL-backed data storage.' },
          ].map(f => (
            <div key={f.title} style={styles.card}>
              <div style={styles.cardIcon}>{f.icon}</div>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div style={{ ...styles.section, background: '#f0f4ff' }}>
        <h2 style={styles.sectionTitle}>Who Is It For?</h2>
        <div style={styles.grid3}>
          {[
            { role: 'Admin', icon: '🛡️', desc: 'Full control — manage certificate types, categories, issue and delete certificates.' },
            { role: 'Certificate Issuer', icon: '✍️', desc: 'Issue certificates to recipients and download PDFs.' },
            { role: 'Recipient', icon: '🎖️', desc: 'View your received certificates and download them anytime.' },
          ].map(r => (
            <div key={r.role} style={styles.roleCard}>
              <div style={styles.cardIcon}>{r.icon}</div>
              <h3 style={styles.cardTitle}>{r.role}</h3>
              <p style={styles.cardDesc}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={styles.cta}>
        <h2 style={{ color: '#fff', fontSize: 28, marginBottom: 12 }}>Ready to get started?</h2>
        <p style={{ color: '#cbd5e1', marginBottom: 24 }}>Create your account and start issuing certificates today.</p>
        <Link to="/register" style={styles.btnPrimary}>Create Account</Link>
      </div>
    </div>
  );
}

const styles = {
  page: { background: '#f8fafc' },
  hero: { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '80px 32px', textAlign: 'center' },
  heroContent: { maxWidth: 700, margin: '0 auto' },
  heroTitle: { color: '#fff', fontSize: 40, fontWeight: 'bold', marginBottom: 16, lineHeight: 1.2 },
  heroSub: { color: '#bfdbfe', fontSize: 18, marginBottom: 32 },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { background: '#fff', color: '#1e3a8a', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 15 },
  btnOutline: { background: 'transparent', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 15, border: '2px solid #fff' },
  section: { padding: '60px 32px', maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 28, color: '#1e3a8a', textAlign: 'center', marginBottom: 40 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px #0001' },
  roleCard: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px #0001', textAlign: 'center' },
  cardIcon: { fontSize: 36, marginBottom: 12 },
  cardTitle: { fontSize: 18, color: '#1e3a8a', marginBottom: 8 },
  cardDesc: { color: '#64748b', fontSize: 14, lineHeight: 1.6 },
  cta: { background: '#1e3a8a', padding: '60px 32px', textAlign: 'center' },
};
