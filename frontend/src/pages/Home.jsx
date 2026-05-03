import { Link } from 'react-router-dom';
import { colors } from '../theme';

export default function Home() {
  const features = [
    { icon: 'fa-certificate', title: 'Issue Certificates', desc: 'Dynamically generate certificates with custom types and categories.' },
    { icon: 'fa-magnifying-glass', title: 'Verify Instantly', desc: 'Verify any certificate using a unique code or QR scan.' },
    { icon: 'fa-file-pdf', title: 'PDF Download', desc: 'Download beautifully styled certificates as PDF files.' },
    { icon: 'fa-folder-tree', title: 'Manage Categories', desc: 'Organize certificates by AI, Networking, Cloud, and more.' },
    { icon: 'fa-users', title: 'Role-Based Access', desc: 'Admin, Issuer, and Recipient roles with tailored dashboards.' },
    { icon: 'fa-lock', title: 'Secure & Scalable', desc: 'JWT authentication and PostgreSQL-backed data storage.' },
  ];

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div className="hero-section" style={styles.hero}>
        <div style={styles.heroContent}>
          <i className="fa-solid fa-graduation-cap" style={styles.heroIcon}></i>
          <h1 className="hero-title" style={styles.heroTitle}>Certificate Generation System</h1>
          <p className="hero-sub" style={styles.heroSub}>Issue, manage and verify professional certificates with ease.</p>
          <div className="hero-btns" style={styles.heroBtns}>
            <Link to="/register" style={styles.btnOutline}>
              <i className="fa-solid fa-user-plus" style={{ marginRight: 8 }}></i>Get Started — Register
            </Link>
            <Link to="/login" style={styles.btnPrimary}>
              <i className="fa-solid fa-right-to-bracket" style={{ marginRight: 8 }}></i>Sign In
            </Link>
            <Link to="/verify" style={styles.btnGhost}>
              <i className="fa-solid fa-magnifying-glass" style={{ marginRight: 8 }}></i>Verify Certificate
            </Link>
          </div>
          <p className="hero-hint" style={styles.heroHint}>
            Already have an account? <Link to="/login" style={styles.heroHintLink}>Sign in here</Link>
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="home-section" style={styles.section}>
        <h2 className="home-section-title" style={styles.sectionTitle}>Features</h2>
        <div style={styles.grid}>
          {features.map(f => (
            <div key={f.title} style={styles.card}>
              <i className={`fa-solid ${f.icon}`} style={styles.cardIcon}></i>
              <h3 style={styles.cardTitle}>{f.title}</h3>
              <p style={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: colors.light },
  hero: {
    background: `linear-gradient(135deg, ${colors.primary} 0%, #1e3a8a 100%)`,
    padding: '72px 24px',
    textAlign: 'center',
  },
  heroContent: { maxWidth: 620, margin: '0 auto' },
  heroIcon: { fontSize: 48, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: 800, marginBottom: 12, lineHeight: 1.2 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32, lineHeight: 1.6 },
  heroBtns: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { background: colors.surface, color: colors.primary, padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center' },
  btnOutline: { background: colors.secondary, color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', boxShadow: '0 2px 12px rgba(228,58,25,0.35)' },
  btnGhost: { background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '12px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 15, display: 'inline-flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.3)' },
  heroHint: { marginTop: 20, color: 'rgba(255,255,255,0.65)', fontSize: 13 },
  heroHintLink: { color: '#fff', fontWeight: 600, textDecoration: 'underline' },
  section: { padding: '60px 32px', maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 26, color: colors.dark, textAlign: 'center', marginBottom: 40, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  card: { background: colors.surface, borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardIcon: { fontSize: 28, color: colors.primary, marginBottom: 14 },
  cardTitle: { fontSize: 17, color: colors.dark, marginBottom: 8, fontWeight: 600 },
  cardDesc: { color: colors.muted, fontSize: 14, lineHeight: 1.6 },
};
