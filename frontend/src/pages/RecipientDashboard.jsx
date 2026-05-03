import { useEffect, useState } from 'react';
import { getCertificates, downloadCertificate, getMyEnrollments } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Pagination from '../components/Pagination';
import { colors, shadows } from '../theme';

const PAGE_SIZE = 3;

export default function RecipientDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [tab, setTab] = useState('courses');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    getCertificates().then(r => {
      const mine = r.data.filter(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
      setCertificates(mine);
    });
    getMyEnrollments().then(r => setEnrollments(r.data)).catch(() => {});
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
    <DashboardLayout title="My Dashboard">
      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(tab === 'courses' ? styles.tabActive : {}) }} onClick={() => setTab('courses')}>📚 My Courses</button>
        <button style={{ ...styles.tab, ...(tab === 'certs' ? styles.tabActive : {}) }} onClick={() => setTab('certs')}>🎓 My Certificates</button>
      </div>

      {/* Courses Tab */}
      {tab === 'courses' && (
        enrollments.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h3 style={{ color: colors.dark, marginBottom: 8 }}>No courses yet</h3>
            <p style={{ color: colors.muted, marginBottom: 20 }}>Enroll in a course to start learning and earn certificates.</p>
            <Link to="/courses" style={styles.browsBtn}>Browse Courses</Link>
          </div>
        ) : (
          <div className="card-grid" style={styles.grid}>
            {enrollments.map(e => {
              const pct = e.total_lessons > 0 ? Math.round((e.completed_lessons / e.total_lessons) * 100) : 0;
              return (
                <div key={e.id} style={styles.card}>
                  <div style={styles.cardIcon}>📚</div>
                  <h3 style={styles.cardType}>{e.title}</h3>
                  {e.category_name && <div style={styles.courseBadge}>{e.category_name}</div>}
                  <div style={styles.progressWrap}>
                    <div style={styles.progressBar}><div style={{ ...styles.progressFill, width: `${pct}%` }} /></div>
                    <span style={styles.progressLabel}>{pct}% · {e.completed_lessons}/{e.total_lessons} lessons</span>
                  </div>
                  {e.completed_at && <div style={styles.completedBadge}>✅ Completed</div>}
                  <Link to={`/courses/${e.course_id}/learn`} style={styles.dlBtn}>{e.completed_at ? 'Review Course' : 'Continue'}</Link>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Certificates Tab */}
      {tab === 'certs' && (
        certificates.length === 0 ? (
          <div style={styles.empty}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎖️</div>
            <h3 style={{ color: colors.dark, marginBottom: 8 }}>No certificates yet</h3>
            <p style={{ color: colors.muted }}>Complete a course to earn your certificate automatically.</p>
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
        )
      )}
    </DashboardLayout>
  );
}

const styles = {
  tabs: { display: 'flex', gap: 8, marginBottom: 24 },
  tab: { background: colors.light, color: colors.muted, border: 'none', padding: '9px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  tabActive: { background: colors.primary, color: '#fff' },
  search: { width: '100%', maxWidth: 360, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, marginBottom: 24, boxSizing: 'border-box', color: colors.dark },
  empty: { background: colors.surface, borderRadius: 12, padding: 60, textAlign: 'center', boxShadow: shadows.panel },
  browsBtn: { background: colors.primary, color: '#fff', padding: '10px 24px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 },
  card: { background: colors.surface, borderRadius: 12, padding: 24, boxShadow: shadows.panel, display: 'flex', flexDirection: 'column', gap: 8 },
  cardIcon: { fontSize: 36 },
  cardType: { fontSize: 18, color: colors.dark, margin: 0 },
  courseBadge: { background: `${colors.primary}15`, color: colors.primary, fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500, display: 'inline-block' },
  progressWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  progressBar: { height: 6, background: colors.light, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#4ade80', borderRadius: 3, transition: 'width 0.4s' },
  progressLabel: { fontSize: 12, color: colors.muted },
  completedBadge: { background: 'rgba(40,167,69,0.1)', color: '#1b6f35', fontSize: 12, padding: '4px 10px', borderRadius: 6, fontWeight: 600, display: 'inline-block' },
  info: { fontSize: 13, color: colors.muted, lineHeight: 2 },
  label: { fontWeight: 600, color: colors.dark },
  code: { background: colors.light, padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  actions: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  dlBtn: { background: colors.secondary, color: colors.surface, padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13, textAlign: 'center' },
  verifyLink: { background: colors.light, color: colors.dark, padding: '8px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 },
};
