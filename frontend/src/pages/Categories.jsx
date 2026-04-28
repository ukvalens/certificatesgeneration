import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { colors, shadows } from '../theme';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const load = () => getCategories().then(r => setCategories(r.data));

  useEffect(() => { load(); }, []);

  const handleAdd = () => {
    if (!name.trim()) return alert('Category name is required');
    createCategory({ name: name.trim() })
      .then(() => { setName(''); load(); })
      .catch(err => alert(err.response?.data?.error || 'Failed to add category'));
  };

  const handleEditSave = (id) => {
    updateCategory(id, { name: editName }).then(() => { setEditId(null); load(); });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this category?')) deleteCategory(id).then(load);
  };

  return (
    <DashboardLayout title="Categories">
      <div className="responsive-form" style={styles.form}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Category name" style={styles.input} />
        <button onClick={handleAdd} style={styles.btn}>Add Category</button>
      </div>
      <div className="table-responsive">
        <table style={styles.table}>
        <thead>
          <tr><th style={styles.th}>ID</th><th style={styles.th}>Name</th><th style={styles.th}>Actions</th></tr>
        </thead>
        <tbody>
          {categories.map(c => editId === c.id ? (
            <tr key={c.id} style={{ background: colors.light }}>
              <td style={styles.td}>{c.id}</td>
              <td style={styles.td}>
                <input value={editName} onChange={e => setEditName(e.target.value)} style={styles.inlineInput} />
              </td>
              <td style={styles.td}>
                <button onClick={() => handleEditSave(c.id)} style={styles.saveBtn}>Save</button>
                <button onClick={() => setEditId(null)} style={styles.cancelBtn}>Cancel</button>
              </td>
            </tr>
          ) : (
            <tr key={c.id}>
              <td style={styles.td}>{c.id}</td>
              <td style={styles.td}>{c.name}</td>
              <td style={styles.td}>
                <button onClick={() => { setEditId(c.id); setEditName(c.name); }} style={styles.editBtn}>Edit</button>
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
