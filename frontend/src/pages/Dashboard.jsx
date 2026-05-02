import { useEffect, useState } from 'react';
import { getCertificates, getCertificateTypes, getCategories } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { colors, shadows } from '../theme';

export default function Dashboard() {
  const [stats, setStats] = useState({ certificates: 0, types: 0, categories: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([getCertificates(), getCertificateTypes(), getCategories()]).then(
      ([certs, types, cats]) => {
        setStats({ certificates: certs.data.length, types: types.data.length, categories: cats.data.length });
        setRecent(certs.data.slice(0, 5));
      }
    );
  }, []);

  return (
    <DashboardLayout title="Admin Overview">
      <div className="card-grid" style={styles.cards}>
        <StatCard label="Total Certificates" value={stats.certificates} color={colors.primary} icon="🎓" />
        <StatCard label="Courses" value={stats.types} color={colors.secondary} icon="📚" />
        <StatCard label="Certificate Types" value={stats.categories} color={colors.dark} icon="🗂️" />
      </div>
      <h2 style={styles.subtitle}>Recent Certificates</h2>
      <div className="table-responsive">
        <table style={styles.table}>
        <thead>
          <tr>{['Name', 'Course', 'Certificate Type', 'Code', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {recent.map(c => (
            <tr key={c.id}>
              <td style={styles.td}>{c.user_name}</td>
              <td style={styles.td}>{c.certificate_type}</td>
              <td style={styles.td}>{c.category || '—'}</td>
              <td style={styles.td}><code style={styles.code}>{c.certificate_code}</code></td>
              <td style={styles.td}>{new Date(c.issue_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card" style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 'bold', color }}>{value}</div>
      <div style={{ color: colors.muted, marginTop: 4, fontSize: 14 }}>{label}</div>
    </div>
  );
}

const styles = {
  cards: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 },
  card: { background: colors.surface, borderRadius: 10, padding: '24px 32px', boxShadow: shadows.panel, minWidth: 180 },
  subtitle: { fontSize: 18, color: colors.dark, marginBottom: 12 },
  code: { background: colors.light, padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: colors.surface, borderRadius: 10, overflow: 'hidden', boxShadow: shadows.panel },
  th: { background: colors.primary, color: colors.surface, padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14 },
};
