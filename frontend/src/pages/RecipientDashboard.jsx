import { useEffect, useState } from 'react';
import { getCertificates, downloadCertificate } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Pagination from '../components/Pagination';
import { colors, shadows } from '../theme';

const PAGE_SIZE = 5;

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handleSearch = (val) => { setSearch(val); setPage(1); };

  return (
    <DashboardLayout title="My Certificates">
      {certificates.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎖️</div>
          <h3 style={{ color: colors.dark, marginBottom: 8 }}>No certificates yet</h3>
          <p style={{ color: colors.muted }}>Your issued certificates will appear here once an issuer assigns them to your email.</p>
        </div>
      ) : (
        <>
          <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search certificates..." style={styles.search} />
          <div className="card-grid" style={styles.grid}>
            {paginated.map(c => (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardIcon}>🎓</div>
                <h3 style={styles.cardType}>{c.certificate_type}</h3>
                {c.category && <div style={styles.courseBadge}>{c.category}</div>}
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
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

const styles = {
  search: { width: '100%', maxWidth: 360, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginBottom: 24, boxSizing: 'border-box', color: colors.dark },
  empty: { background: colors.surface, borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: shadows.panel },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card: { background: colors.surface, borderRadius: 12, padding: 24, boxShadow: shadows.panel },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardType: { fontSize: 18, color: colors.dark, marginBottom: 8 },
  courseBadge: { background: `${colors.primary}15`, color: colors.primary, fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500, display: 'inline-block', marginBottom: 12 },
  info: { fontSize: 13, color: colors.muted, lineHeight: 2, marginBottom: 16 },
  label: { fontWeight: 600, color: colors.dark },
  code: { background: colors.light, padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  dlBtn: { background: colors.secondary, color: colors.surface, padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 },
  verifyLink: { background: colors.light, color: colors.dark, padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 },
};
