import { useEffect, useState } from 'react';
import { getCertificateTypes, getCategories, createCertificateType, deleteCertificateType } from '../api';

export default function CertificateTypes() {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', category_id: '', description: '' });

  const load = () => getCertificateTypes().then(r => setTypes(r.data));

  useEffect(() => {
    load();
    getCategories().then(r => setCategories(r.data));
  }, []);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createCertificateType(form).then(() => {
      setForm({ name: '', category_id: '', description: '' });
      load();
    });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this certificate type?')) deleteCertificateType(id).then(load);
  };

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Certificate Types</h1>
      <div style={styles.form}>
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Type name" style={styles.input} />
        <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={styles.input}>
          <option value="">No Category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description" style={styles.input} />
        <button onClick={handleAdd} style={styles.btn}>Add Type</button>
      </div>
      <table style={styles.table}>
        <thead>
          <tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Category</th><th style={styles.th}>Description</th><th style={styles.th}>Actions</th></tr>
        </thead>
        <tbody>
          {types.map(t => (
            <tr key={t.id}>
              <td style={styles.td}>{t.id}</td>
              <td style={styles.td}>{t.name}</td>
              <td style={styles.td}>{t.category_name || '—'}</td>
              <td style={styles.td}>{t.description || '—'}</td>
              <td style={styles.td}>
                <button onClick={() => handleDelete(t.id)} style={styles.delBtn}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  page: { padding: 32 },
  title: { fontSize: 28, color: '#1e3a8a', marginBottom: 24 },
  form: { display: 'flex', gap: 12, marginBottom: 24 },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: 14 },
  btn: { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  delBtn: { background: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px #0001' },
  th: { background: '#1e3a8a', color: '#fff', padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: '1px solid #f1f5f9', fontSize: 14 },
};
