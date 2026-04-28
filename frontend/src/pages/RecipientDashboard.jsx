import { useEffect, useState } from 'react';
import { getCertificates, downloadCertificate } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCertificates().then(r => {
      const mine = r.data.filter(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
      setCertificates(mine);
    });
  }, [user]);

  const filtered = certificates.filter(c =>
    c.user_name.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_code.toLowerCase().includes(search.toLowerCase()) ||
    (c.certificate_type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Certificates</h1>
          <p style={styles.sub}>Welcome, {user?.name}</p>
        </div>
        <Link to="/verify" style={styles.verifyBtn}>🔍 Verify a Certificate</Link>
      </div>

      {certificates.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎖️</div>
          <h3 style={{ color: '#1e3a8a', marginBottom: 8 }}>No certificates yet</h3>
          <p style={{ color: '#64748b' }}>Your issued certificates will appear here once an issuer assigns them to your email.</p>
        </div>
      ) : (
        <>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search certificates..." style={styles.search} />
          <div style={styles.grid}>
            {filtered.map(c => (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardIcon}>🎓</div>
                <h3 style={styles.cardType}>{c.certificate_type}</h3>
                {c.category && <span style={styles.badge}>{c.category}</span>}
                <div style={styles.info}>
                  <div><span style={styles.label}>Issued to:</span> {c.user_name}</div>
                  <div><span style={styles.label}>Date:</span> {new Date(c.issue_date).toLocaleDateString()}</div>
                  <div><span style={styles.label}>Code:</span> <code style={styles.code}>{c.certificate_code}</code></div>
                </div>
                <div style={styles.actions}>
                  <a href={downloadCertificate(c.id)} target="_blank" rel="noreferrer" style={styles.dlBtn}>📄 Download PDF</a>
                  <Link to={`/verify/${c.certificate_code}`} style={styles.verifyLink}>🔍 Verify</Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page: { padding: 32 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 28, color: '#1e3a8a', marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 14 },
  verifyBtn: { background: '#2563eb', color: '#fff', padding: '10px 18px', borderRadius: 6, textDecoration: 'none', fontSize: 14 },
  search: { width: '100%', maxWidth: 360, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14, marginBottom: 24, boxSizing: 'border-box' },
  empty: { background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: '0 2px 8px #0001' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px #0001' },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardType: { fontSize: 18, color: '#1e3a8a', marginBottom: 8 },
  badge: { background: '#eff6ff', color: '#2563eb', padding: '3px 10px', borderRadius: 20, fontSize: 12, display: 'inline-block', marginBottom: 12 },
  info: { fontSize: 13, color: '#475569', lineHeight: 2, marginBottom: 16 },
  label: { fontWeight: 600, color: '#1e293b' },
  code: { background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  actions: { display: 'flex', gap: 10 },
  dlBtn: { background: '#16a34a', color: '#fff', padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 },
  verifyLink: { background: '#f1f5f9', color: '#1e3a8a', padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 },
};
