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
  section: { padding: '60px 32px', maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 26, color: colors.dark, textAlign: 'center', marginBottom: 40, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  card: { background: colors.surface, borderRadius: 12, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' },
  cardIcon: { fontSize: 28, color: colors.primary, marginBottom: 14 },
  cardTitle: { fontSize: 17, color: colors.dark, marginBottom: 8, fontWeight: 600 },
  cardDesc: { color: colors.muted, fontSize: 14, lineHeight: 1.6 },
};
