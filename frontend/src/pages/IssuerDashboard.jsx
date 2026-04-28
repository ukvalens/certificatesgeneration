import { useEffect, useState } from 'react';
import { getCertificates, getCertificateTypes, createCertificate, downloadCertificate } from '../api';
import { useAuth } from '../context/AuthContext';

export default function IssuerDashboard() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ user_name: '', email: '', certificate_type_id: '', issue_date: '' });
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => getCertificates().then(r => setCertificates(r.data));

  useEffect(() => {
    load();
    getCertificateTypes().then(r => setTypes(r.data));
  }, []);

  const handleIssue = () => {
    if (!form.user_name.trim() || !form.certificate_type_id) return alert('Name and type are required');
    createCertificate(form).then(() => {
      setForm({ user_name: '', email: '', certificate_type_id: '', issue_date: '' });
      setSuccess('Certificate issued successfully!');
      setTimeout(() => setSuccess(''), 3000);
      load();
    });
  };

  const filtered = certificates.filter(c =>
    c.user_name.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Issuer Dashboard</h1>
          <p style={styles.sub}>Welcome, {user?.name}</p>
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Issue New Certificate</h2>
        {success && <div style={styles.success}>{success}</div>}
        <div style={styles.form}>
          <input value={form.user_name} onChange={e => setForm({ ...form, user_name: e.target.value })} placeholder="Recipient Name *" style={styles.input} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Recipient Email" style={styles.input} />
          <select value={form.certificate_type_id} onChange={e => setForm({ ...form, certificate_type_id: e.target.value })} style={styles.input}>
            <option value="">Select Certificate Type *</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}{t.category_name ? ` (${t.category_name})` : ''}</option>)}
          </select>
          <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} style={styles.input} />
          <button onClick={handleIssue} style={styles.btn}>Issue Certificate</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '24px 0 12px' }}>
        <h2 style={styles.cardTitle}>Issued Certificates</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ ...styles.input, maxWidth: 260 }} />
      </div>

      <table style={styles.table}>
        <thead>
          <tr>{['Name', 'Email', 'Type', 'Category', 'Code', 'Date', 'PDF'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(c => (
            <tr key={c.id}>
              <td style={styles.td}>{c.user_name}</td>
              <td style={styles.td}>{c.email || '—'}</td>
              <td style={styles.td}>{c.certificate_type}</td>
              <td style={styles.td}>{c.category || '—'}</td>
              <td style={styles.td}><code style={styles.code}>{c.certificate_code}</code></td>
              <td style={styles.td}>{new Date(c.issue_date).toLocaleDateString()}</td>
              <td style={styles.td}><a href={downloadCertificate(c.id)} target="_blank" rel="noreferrer" style={styles.dlBtn}>PDF</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  page: { padding: 32 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  title: { fontSize: 28, color: '#1e3a8a', marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 14 },
  card: { background: '#fff', borderRadius: 10, padding: 24, boxShadow: '0 2px 8px #0001', marginBottom: 8 },
  cardTitle: { fontSize: 18, color: '#1e3a8a', marginBottom: 16 },
  form: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 160, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14 },
  btn: { background: '#16a34a', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  dlBtn: { background: '#2563eb', color: '#fff', padding: '5px 10px', borderRadius: 4, fontSize: 12, textDecoration: 'none' },
  success: { background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  code: { background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #0001' },
  th: { background: '#1e3a8a', color: '#fff', padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
};
