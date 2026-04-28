import { useEffect, useState } from 'react';
import { getCertificateTypes, getCategories, createCertificateType, updateCertificateType, deleteCertificateType } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { colors, shadows } from '../theme';

export default function CertificateTypes() {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', category_id: '', description: '' });
  const [editId, setEditId] = useState(null);
  const [editRow, setEditRow] = useState({ name: '', category_id: '', description: '' });

  const load = () => getCertificateTypes().then(r => setTypes(r.data));

  useEffect(() => {
    load();
    getCategories().then(r => setCategories(r.data));
  }, []);

  const handleAdd = () => {
    if (!form.name.trim()) return alert('Type name is required');
    const payload = { ...form, category_id: form.category_id || null };
    createCertificateType(payload)
      .then(() => { setForm({ name: '', category_id: '', description: '' }); load(); })
      .catch(err => alert(err.response?.data?.error || 'Failed to add type'));
  };

  const handleEditSave = (id) => {
    const payload = { ...editRow, category_id: editRow.category_id || null };
    updateCertificateType(id, payload).then(() => { setEditId(null); load(); });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this certificate type?')) deleteCertificateType(id).then(load);
  };

  return (
    <DashboardLayout title="Certificate Types">
      <div className="responsive-form" style={styles.form}>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Type name" style={styles.input} />
        <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={styles.input}>
          <option value="">No Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={styles.input} />
        <button onClick={handleAdd} style={styles.btn}>Add Type</button>
      </div>
      <div className="table-responsive">
        <table style={styles.table}>
        <thead>
          <tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Category</th><th style={styles.th}>Description</th><th style={styles.th}>Actions</th></tr>
        </thead>
        <tbody>
          {types.map(t => editId === t.id ? (
            <tr key={t.id} style={{ background: colors.light }}>
              <td style={styles.td}>{t.id}</td>
              <td style={styles.td}><input value={editRow.name} onChange={e => setEditRow({ ...editRow, name: e.target.value })} style={styles.inlineInput} /></td>
              <td style={styles.td}>
                <select value={editRow.category_id} onChange={e => setEditRow({ ...editRow, category_id: e.target.value })} style={styles.inlineInput}>
                  <option value="">No Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </td>
              <td style={styles.td}><input value={editRow.description} onChange={e => setEditRow({ ...editRow, description: e.target.value })} style={styles.inlineInput} /></td>
              <td style={styles.td}>
                <button onClick={() => handleEditSave(t.id)} style={styles.saveBtn}>Save</button>
                <button onClick={() => setEditId(null)} style={styles.cancelBtn}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={t.id}>
              <td style={styles.td}>{t.id}</td>
              <td style={styles.td}>{t.name}</td>
              <td style={styles.td}>{t.category_name || '—'}</td>
              <td style={styles.td}>{t.description || '—'}</td>
              <td style={styles.td}>
                <button onClick={() => { setEditId(t.id); setEditRow({ name: t.name, category_id: t.category_id || '', description: t.description || '' }); }} style={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(t.id)} style={styles.delBtn}>Delete</button>
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
  form: { display: 'flex', gap: 12, marginBottom: 24 },
  input: { flex: 1, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark },
  inlineInput: { width: '100%', padding: '6px 10px', border: `1px solid ${colors.secondary}`, borderRadius: 4, fontSize: 13 },
  btn: { background: colors.primary, color: colors.surface, border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  editBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  saveBtn: { background: colors.primary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  cancelBtn: { background: colors.dark, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  delBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: colors.surface, borderRadius: 10, overflow: 'hidden', boxShadow: shadows.panel },
  th: { background: colors.primary, color: colors.surface, padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14 },
};
