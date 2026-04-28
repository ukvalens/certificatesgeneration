import { useEffect, useState } from 'react';
import { getCertificates, getCertificateTypes, getCategories } from '../api';

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
    <div style={styles.page}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      <div style={styles.cards}>
        <StatCard label="Total Certificates" value={stats.certificates} color="#2563eb" />
        <StatCard label="Certificate Types" value={stats.types} color="#16a34a" />
        <StatCard label="Categories" value={stats.categories} color="#d97706" />
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
              <td style={styles.td}><code>{c.certificate_code}</code></td>
              <td style={styles.td}>{new Date(c.issue_date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ fontSize: 36, fontWeight: 'bold', color }}>{value}</div>
      <div style={{ color: '#64748b', marginTop: 4 }}>{label}</div>
    </div>
  );
}

const styles = {
  page: { padding: 32 },
  title: { fontSize: 28, color: '#1e3a8a', marginBottom: 24 },
  subtitle: { fontSize: 20, color: '#1e3a8a', margin: '32px 0 12px' },
  cards: { display: 'flex', gap: 20 },
  card: { background: '#fff', borderRadius: 10, padding: '24px 32px', boxShadow: '0 2px 8px #0001', minWidth: 180 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #0001' },
  th: { background: '#1e3a8a', color: '#fff', padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
};
