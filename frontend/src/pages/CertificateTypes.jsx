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
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;

  const load = () => Promise.all([getCertificateTypes(), getCategories()]).then(([t, c]) => {
    setTypes(t.data);
    setCategories(c.data);
  });

  useEffect(() => { load(); }, []);

  const handleAdd = () => {
    if (!form.name.trim()) return alert('Course name is required');
    createCertificateType({ ...form, category_id: form.category_id || null })
      .then(() => { setForm({ name: '', category_id: '', description: '' }); setPage(1); load(); })
      .catch(err => alert(err.response?.data?.error || 'Failed to add type'));
  };

  const handleEditSave = (id) => {
    updateCertificateType(id, { ...editRow, category_id: editRow.category_id || null })
      .then(() => { setEditId(null); load(); });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this course?')) deleteCertificateType(id).then(load);
  };

  const totalPages = Math.ceil(types.length / PAGE_SIZE);
  const paginated = types.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout title="Courses">
      <div style={styles.formCard}>
        <h2 style={styles.formTitle}>Add Course</h2>
        <div className="responsive-form" style={styles.form}>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Course name (e.g. CCNA, IT Essentials)" style={styles.input} />
          <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={styles.input}>
            <option value="">— Select Certificate Type —</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" style={styles.input} />
        </div>
        <button onClick={handleAdd} style={styles.btn}>Add Course</button>
      </div>
      <div className="table-responsive">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Course</th>
              <th style={styles.th}>Certificate Type</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(t => editId === t.id ? (
              <tr key={t.id} style={{ background: colors.light }}>
                <td style={styles.td}><input value={editRow.name} onChange={e => setEditRow({ ...editRow, name: e.target.value })} style={styles.inlineInput} /></td>
                <td style={styles.td}>
                  <select value={editRow.category_id} onChange={e => setEditRow({ ...editRow, category_id: e.target.value })} style={styles.inlineInput}>
                    <option value="">— Select Certificate Type —</option>
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
                <td style={styles.td}>{t.name}</td>
                <td style={styles.td}>
                  {t.category_name
                    ? <span style={styles.catBadge}>{t.category_name}</span>
                    : <span style={{ color: colors.muted }}>—</span>}
                </td>
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
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={styles.pageBtn}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={styles.pageBtn}>Next ›</button>
        </div>
      )}
    </DashboardLayout>
  );
}

const styles = {
  form: { gap: 12, marginBottom: 16 },
  formCard: { background: colors.surface, borderRadius: 10, padding: 24, boxShadow: shadows.panel, marginBottom: 24 },
  formTitle: { fontSize: 16, color: colors.dark, marginBottom: 16, fontWeight: 600 },
  input: { flex: 1, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark },
  inlineInput: { width: '100%', padding: '6px 10px', border: `1px solid ${colors.secondary}`, borderRadius: 4, fontSize: 13 },
  btn: { background: colors.primary, color: colors.surface, border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' },
  catBadge: { background: `${colors.primary}15`, color: colors.primary, fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 500 },
  editBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  saveBtn: { background: colors.primary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  cancelBtn: { background: colors.dark, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  delBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  pagination: { display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginTop: 20, flexWrap: 'wrap' },
  pageBtn: { background: colors.surface, color: colors.dark, border: `1px solid ${colors.border}`, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13 },
  pageBtnActive: { background: colors.primary, color: colors.surface, border: `1px solid ${colors.primary}`, fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', background: colors.surface, borderRadius: 10, overflow: 'hidden', boxShadow: shadows.panel },
  th: { background: colors.primary, color: colors.surface, padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14 },
};
