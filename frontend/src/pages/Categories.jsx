import { useEffect, useState } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory, getCertificateTypes } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { colors, shadows } from '../theme';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  const load = () => Promise.all([
    getCategories(),
    getCertificateTypes(),
  ]).then(([cats, typs]) => {
    setCategories(cats.data);
    setTypes(typs.data);
  });

  useEffect(() => { load(); }, []);

  const handleAdd = () => {
    if (!name.trim()) return alert('Certificate type name is required');
    createCategory({ name: name.trim() })
      .then(() => { setName(''); load(); })
      .catch(err => alert(err.response?.data?.error || 'Failed to add certificate type'));
  };

  const handleEditSave = (id) => {
    updateCategory(id, { name: editName }).then(() => { setEditId(null); load(); });
  };

  const handleDelete = (id) => {
    if (confirm('Delete this certificate type?')) deleteCategory(id).then(load);
  };

  const coursesFor = (categoryId) => types.filter(t => Number(t.category_id) === Number(categoryId));
  const unassigned = types.filter(t => !t.category_id);

  return (
    <DashboardLayout title="Certificate Types">
      <div className="responsive-form" style={styles.form}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Certificate type name (e.g. Networking)" style={styles.input} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
        <button onClick={handleAdd} style={styles.btn}>Add Certificate Type</button>
      </div>

      <div style={styles.list}>
        {categories.map(c => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardHeader}>
              {editId === c.id ? (
                <>
                  <input value={editName} onChange={e => setEditName(e.target.value)} style={styles.inlineInput} autoFocus />
                  <div style={styles.actions}>
                    <button onClick={() => handleEditSave(c.id)} style={styles.saveBtn}>Save</button>
                    <button onClick={() => setEditId(null)} style={styles.cancelBtn}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span style={styles.catName}>{c.name}</span>
                    <span style={styles.countBadge}>{coursesFor(c.id).length} course{coursesFor(c.id).length !== 1 ? 's' : ''}</span>
                  </div>
                  <div style={styles.actions}>
                    <button onClick={() => { setEditId(c.id); setEditName(c.name); }} style={styles.editBtn}>Edit</button>
                    <button onClick={() => handleDelete(c.id)} style={styles.delBtn}>Delete</button>
                  </div>
                </>
              )}
            </div>
            {coursesFor(c.id).length > 0 && (
              <div style={styles.typeList}>
                {coursesFor(c.id).map(t => (
                  <span key={t.id} style={styles.typeTag}>{t.name}</span>
                ))}
              </div>
            )}
          </div>
        ))}

        {unassigned.length > 0 && (
          <div style={{ ...styles.card, borderLeft: `4px solid ${colors.muted}` }}>
            <div style={styles.cardHeader}>
              <div>
                <span style={{ ...styles.catName, color: colors.muted }}>Uncategorized</span>
                <span style={styles.countBadge}>{unassigned.length} course{unassigned.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
            <div style={styles.typeList}>
              {unassigned.map(t => (
                <span key={t.id} style={{ ...styles.typeTag, background: colors.light, color: colors.muted }}>{t.name}</span>
              ))}
            </div>
          </div>
        )}

        {categories.length === 0 && (
          <div style={styles.empty}>No certificate types yet. Add one above.</div>
        )}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  form: { display: 'flex', gap: 12, marginBottom: 28 },
  input: { flex: 1, padding: '10px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark },
  inlineInput: { flex: 1, padding: '7px 12px', border: `1px solid ${colors.primary}`, borderRadius: 6, fontSize: 14, color: colors.dark },
  btn: { background: colors.primary, color: colors.surface, border: 'none', padding: '10px 20px', borderRadius: 6, cursor: 'pointer', fontSize: 14, whiteSpace: 'nowrap' },
  list: { display: 'flex', flexDirection: 'column', gap: 16 },
  card: { background: colors.surface, borderRadius: 10, boxShadow: shadows.panel, borderLeft: `4px solid ${colors.primary}`, overflow: 'hidden' },
  cardHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', gap: 12, flexWrap: 'wrap' },
  catName: { fontSize: 16, fontWeight: 600, color: colors.dark, marginRight: 10 },
  countBadge: { background: colors.light, color: colors.primary, fontSize: 12, padding: '2px 10px', borderRadius: 20, fontWeight: 500 },
  typeList: { display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 20px 16px' },
  typeTag: { background: `${colors.primary}15`, color: colors.primary, fontSize: 13, padding: '4px 12px', borderRadius: 20, fontWeight: 500 },
  actions: { display: 'flex', gap: 8 },
  editBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  saveBtn: { background: colors.primary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  cancelBtn: { background: colors.dark, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  delBtn: { background: colors.secondary, color: colors.surface, border: 'none', padding: '6px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  empty: { color: colors.muted, textAlign: 'center', padding: 40, background: colors.surface, borderRadius: 10 },
};
