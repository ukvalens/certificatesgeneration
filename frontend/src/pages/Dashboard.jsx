import { useEffect, useState } from 'react';
import { getCertificates, getCertificateTypes, getCategories } from '../api';
import DashboardLayout from '../components/DashboardLayout';

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
      <div style={styles.cards}>
        <StatCard label="Total Certificates" value={stats.certificates} color="#2563eb" icon="🎓" />
        <StatCard label="Certificate Types" value={stats.types} color="#16a34a" icon="📋" />
        <StatCard label="Categories" value={stats.categories} color="#d97706" icon="🗂️" />
      </div>
      <h2 style={styles.subtitle}>Recent Certificates</h2>
      <table style={styles.table}>
        <thead>
          <tr>{['Name', 'Type', 'Category', 'Code', 'Date'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
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
    </DashboardLayout>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 36, fontWeight: 'bold', color }}>{value}</div>
      <div style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>{label}</div>
    </div>
  );
}

const styles = {
  cards: { display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 32 },
  card: { background: '#fff', borderRadius: 10, padding: '24px 32px', boxShadow: '0 2px 8px #0001', minWidth: 180 },
  subtitle: { fontSize: 18, color: '#1e3a8a', marginBottom: 12 },
  code: { background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #0001' },
  th: { background: '#1e3a8a', color: '#fff', padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
};
