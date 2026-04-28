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
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Features</h2>
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
  page: { background: '#f8fafc' },
  hero: { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '80px 32px', textAlign: 'center' },
  heroContent: { maxWidth: 600, margin: '0 auto' },
  heroIcon: { fontSize: 52, color: '#fff', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 42, fontWeight: 'bold', marginBottom: 12 },
  heroSub: { color: '#bfdbfe', fontSize: 17, marginBottom: 32 },
  heroBtns: { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { background: '#fff', color: '#1e3a8a', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 15 },
  btnOutline: { background: 'transparent', color: '#fff', padding: '12px 28px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 15, border: '2px solid #fff' },
  section: { padding: '60px 32px', maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { fontSize: 26, color: '#1e3a8a', textAlign: 'center', marginBottom: 40, fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 2px 12px #0001' },
  cardIcon: { fontSize: 28, color: '#2563eb', marginBottom: 14 },
  cardTitle: { fontSize: 17, color: '#1e3a8a', marginBottom: 8, fontWeight: 600 },
  cardDesc: { color: '#64748b', fontSize: 14, lineHeight: 1.6 },
};
