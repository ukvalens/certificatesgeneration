import { useEffect, useState } from 'react';
import { getCertificates, getCertificateTypes, createCertificate, updateCertificate, deleteCertificate, downloadCertificate } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { colors, shadows } from '../theme';

export default function Certificates() {
  const [certificates, setCertificates] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ user_name: '', email: '', organization: '', header_text: '', description: '', certificate_type_id: '', issue_date: '' });
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState({});

  const load = () => getCertificates().then(r => setCertificates(r.data));

  useEffect(() => {
    load();
    getCertificateTypes().then(r => setTypes(r.data));
  }, []);

  const handleIssue = () => {
    if (!form.user_name.trim() || !form.certificate_type_id) return alert('Name and course are required');
    createCertificate(form).then(() => {
      setForm({ user_name: '', email: '', organization: '', header_text: '', description: '', certificate_type_id: '', issue_date: '' });
      load();
    });
  };

  const handleEditStart = (c) => {
    setEditId(c.id);
    setEditRow({
      user_name: c.user_name,
      email: c.email || '',
      organization: c.organization || '',
      header_text: c.header_text || '',
      description: c.description || '',
      certificate_type_id: c.certificate_type_id,
      issue_date: c.issue_date ? c.issue_date.split('T')[0] : '',
    });
  };

  const handleEditSave = (id) => {
    updateCertificate(id, editRow).then(() => { setEditId(null); load(); });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this certificate?')) deleteCertificate(id).then(load);
  };

  const filtered = certificates.filter(c =>
    c.user_name.toLowerCase().includes(search.toLowerCase()) ||
    c.certificate_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Certificates">
      <div style={styles.card}>
        <h2 style={styles.subtitle}>Issue New Certificate</h2>
        <div className="form-grid" style={styles.form}>
          <input value={form.user_name} onChange={e => setForm({ ...form, user_name: e.target.value })} placeholder="Recipient Name *" style={styles.input} />
          <input value={form.header_text} onChange={e => setForm({ ...form, header_text: e.target.value })} placeholder="Certificate title (optional)" style={styles.input} />
          <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="Organization" style={styles.input} />
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email (optional)" style={styles.input} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Certificate description" style={styles.textarea} />
          <select value={form.certificate_type_id} onChange={e => setForm({ ...form, certificate_type_id: e.target.value })} style={styles.input}>
            <option value="">Select Course *</option>
            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input type="date" value={form.issue_date} onChange={e => setForm({ ...form, issue_date: e.target.value })} style={styles.input} />
          <button onClick={handleIssue} style={styles.btn}>Issue Certificate</button>
        </div>
      </div>

      <div className="responsive-toolbar" style={{ margin: '24px 0 12px' }}>
        <h2 style={styles.subtitle}>Issued Certificates</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or code..." style={{ ...styles.input, maxWidth: 280 }} />
      </div>

      <div className="table-responsive">
        <table style={styles.table}>
        <thead>
          <tr>{['Name', 'Email', 'Course', 'Code', 'Date', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {filtered.map(c => editId === c.id ? (
            <tr key={c.id} style={{ background: colors.light }}>
              <td style={styles.td}><input value={editRow.user_name} onChange={e => setEditRow({ ...editRow, user_name: e.target.value })} style={styles.inlineInput} /></td>
              <td style={styles.td}><input value={editRow.email} onChange={e => setEditRow({ ...editRow, email: e.target.value })} style={styles.inlineInput} /></td>
              <td style={styles.td}>
                <select value={editRow.certificate_type_id} onChange={e => setEditRow({ ...editRow, certificate_type_id: e.target.value })} style={styles.inlineInput}>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </td>
              <td style={styles.td}><code style={styles.code}>{c.certificate_code}</code></td>
              <td style={styles.td}><input type="date" value={editRow.issue_date} onChange={e => setEditRow({ ...editRow, issue_date: e.target.value })} style={styles.inlineInput} /></td>
              <td style={styles.td}>
                <button onClick={() => handleEditSave(c.id)} style={styles.saveBtn}>Save</button>
                <button onClick={() => setEditId(null)} style={styles.cancelBtn}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={c.id}>
              <td style={styles.td}>{c.user_name}</td>
              <td style={styles.td}>{c.email || '—'}</td>
              <td style={styles.td}>{c.certificate_type}</td>
              <td style={styles.td}><code style={styles.code}>{c.certificate_code}</code></td>
              <td style={styles.td}>{new Date(c.issue_date).toLocaleDateString()}</td>
              <td style={styles.td}>
                <button onClick={() => handleEditStart(c)} style={styles.editBtn}>Edit</button>
                <a href={downloadCertificate(c.id)} target="_blank" rel="noreferrer" style={styles.dlBtn}>PDF</a>
                <button onClick={() => handleDelete(c.id)} style={styles.delBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </DashboardLayout>
  );
}

const styles = {
  subtitle: { fontSize: 18, color: colors.dark, marginBottom: 12 },
  card: { background: colors.surface, borderRadius: 10, padding: 24, boxShadow: shadows.panel, marginBottom: 8 },
  form: { gap: 12 },
  input: { flex: 1, minWidth: 160, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark },
  textarea: { flex: 1, minWidth: 160, minHeight: 90, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, resize: 'vertical', color: colors.dark },
  inlineInput: { width: '100%', padding: '6px 10px', border: `1px solid ${colors.primary}`, borderRadius: 4, fontSize: 13 },
  btn: { background: colors.primary, color: colors.surface, border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  editBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  saveBtn: { background: colors.primary, color: colors.surface, border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  cancelBtn: { background: colors.dark, color: colors.surface, border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  dlBtn: { background: colors.primary, color: colors.surface, padding: '5px 10px', borderRadius: 4, fontSize: 12, textDecoration: 'none', marginRight: 6 },
  delBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  code: { background: colors.light, padding: '2px 6px', borderRadius: 4, fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: colors.surface, borderRadius: 10, overflow: 'hidden', boxShadow: shadows.panel },
  th: { background: colors.primary, color: colors.surface, padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14 },
};
