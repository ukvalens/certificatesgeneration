import { useEffect, useState } from 'react';
import { getCertificates, getCertificateTypes, createCertificate, downloadCertificate } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import Pagination from '../components/Pagination';
import { colors, shadows } from '../theme';

const PAGE_SIZE = 10;

export default function IssuerDashboard() {
  const [certificates, setCertificates] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ user_name: '', email: '', certificate_type_id: '', description: '', issue_date: '' });
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);

  const load = () => getCertificates().then(r => setCertificates(r.data));

  useEffect(() => { load(); getCertificateTypes().then(r => setTypes(r.data)); }, []);

  const handleIssue = () => {
    if (!form.user_name.trim() || !form.certificate_type_id) return alert('Name and type are required');
    createCertificate(form).then(() => {
      setForm({ user_name: '', email: '', certificate_type_id: '', description: '', issue_date: '' });
      setSuccess('Certificate issued successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setPage(1); load();
    });
  };

  const filtered = certificates.filter(c =>
    c.user_name.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const handleSearch = (val) => { setSearch(val); setPage(1); };

  return (
    <DashboardLayout title="Issue Certificates">
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Issue New Certificate</h2>
        {success && <div style={styles.success}>{success}</div>}
        <div className="responsive-form" style={styles.form}>
          <input value={form.user_name} onChange={e => setForm({ ...form, user_name: e.target.value })} placeholder="Recipient Name *" style={styles.input} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Recipient Email" style={styles.input} />
          <select value={form.certificate_type_id} onChange={e => {
            const selected = types.find(t => String(t.id) === e.target.value);
            setForm({ ...form, certificate_type_id: e.target.value, description: selected?.description || '' });
          }} style={styles.input}>
            <option value="">Select Course *</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}{t.category_name ? ` — ${t.category_name}` : ''}</option>)}
          </select>
          {form.description ? <div style={styles.descPreview}>{form.description}</div> : null}
          <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} style={styles.input} />
          <button onClick={handleIssue} style={styles.btn}>Issue Certificate</button>
        </div>
      </div>

      <div className="responsive-toolbar" style={{ margin: '24px 0 12px' }}>
        <h2 style={styles.cardTitle}>Issued Certificates ({filtered.length})</h2>
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search..." style={{ ...styles.input, maxWidth: 260 }} />
      </div>

      <div className="table-responsive">
        <table style={styles.table}>
          <thead>
            <tr>{['Name', 'Email', 'Course', 'Code', 'Date', 'PDF'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {paginated.map(c => (
              <tr key={c.id}>
                <td style={styles.td}>{c.user_name}</td>
                <td style={styles.td}>{c.email || '—'}</td>
                <td style={styles.td}>{c.certificate_type}</td>
                <td style={styles.td}><code style={styles.code}>{c.certificate_code}</code></td>
                <td style={styles.td}>{new Date(c.issue_date).toLocaleDateString()}</td>
                <td style={styles.td}><a href={downloadCertificate(c.id)} target="_blank" rel="noreferrer" style={styles.dlBtn}>PDF</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </DashboardLayout>
  );
}

const styles = {
  card: { background: colors.surface, borderRadius: 10, padding: 24, boxShadow: shadows.panel, marginBottom: 8 },
  cardTitle: { fontSize: 18, color: colors.dark, marginBottom: 16 },
  form: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  input: { flex: 1, minWidth: 160, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark },
  btn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  dlBtn: { background: colors.primary, color: colors.surface, padding: '5px 10px', borderRadius: 4, fontSize: 12, textDecoration: 'none' },
  descPreview: { flex: '1 1 100%', background: colors.light, color: colors.muted, padding: '8px 14px', borderRadius: 6, fontSize: 13, fontStyle: 'italic' },
  success: { background: 'rgba(17, 31, 77, 0.08)', color: colors.primary, padding: '10px 14px', borderRadius: 6, marginBottom: 16, fontSize: 14 },
  code: { background: colors.light, padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: colors.surface, borderRadius: 10, overflow: 'hidden', boxShadow: shadows.panel },
  th: { background: colors.primary, color: colors.surface, padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14 },
};
