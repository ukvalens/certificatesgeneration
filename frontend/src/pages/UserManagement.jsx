import { useEffect, useState } from 'react';
import { getUsers, updateUserRole, adminResetPassword, deleteUser } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import Pagination from '../components/Pagination';
import { colors, shadows } from '../theme';

const PAGE_SIZE = 5;
const ROLES = ['recipient', 'issuer', 'admin'];

const roleBadgeColor = { admin: colors.secondary, issuer: colors.primary, recipient: '#6b7280' };

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pwdModal, setPwdModal] = useState(null); // { id, name }
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdErr, setPwdErr] = useState('');

  const load = () => getUsers().then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const handleRoleChange = (id, role) => {
    updateUserRole(id, role).then(load).catch(err => alert(err.response?.data?.error || 'Failed'));
  };

  const handleDelete = (id, name) => {
    if (confirm(`Delete user "${name}"?`)) deleteUser(id).then(load).catch(err => alert(err.response?.data?.error || 'Failed'));
  };

  const handlePwdReset = () => {
    setPwdMsg(''); setPwdErr('');
    if (!newPwd || newPwd.length < 6) { setPwdErr('Password must be at least 6 characters'); return; }
    adminResetPassword(pwdModal.id, newPwd)
      .then(() => { setPwdMsg('Password updated successfully'); setNewPwd(''); setTimeout(() => { setPwdModal(null); setPwdMsg(''); }, 1500); })
      .catch(err => setPwdErr(err.response?.data?.error || 'Failed'));
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout title="User Management">

      {/* Stats row */}
      <div style={styles.statsRow}>
        {ROLES.map(r => (
          <div key={r} style={styles.statCard}>
            <div style={{ ...styles.statDot, background: roleBadgeColor[r] }} />
            <div>
              <div style={styles.statNum}>{users.filter(u => u.role === r).length}</div>
              <div style={styles.statLabel}>{r.charAt(0).toUpperCase() + r.slice(1)}s</div>
            </div>
          </div>
        ))}
        <div style={styles.statCard}>
          <div style={{ ...styles.statDot, background: '#0f766e' }} />
          <div>
            <div style={styles.statNum}>{users.length}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="responsive-toolbar">
        <h2 style={styles.subtitle}>All Users ({filtered.length})</h2>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name, email or role..."
          style={styles.search}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table style={styles.table}>
          <thead>
            <tr>{['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {paginated.map(u => (
              <tr key={u.id}>
                <td style={styles.td}>
                  <div style={styles.nameCell}>
                    <div style={{ ...styles.avatar, background: roleBadgeColor[u.role] }}>{u.name[0].toUpperCase()}</div>
                    <span>{u.name}</span>
                  </div>
                </td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    style={{ ...styles.roleSelect, borderColor: roleBadgeColor[u.role], color: roleBadgeColor[u.role] }}
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </td>
                <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                <td style={styles.td}>
                  <button onClick={() => { setPwdModal({ id: u.id, name: u.name }); setNewPwd(''); setPwdMsg(''); setPwdErr(''); }} style={styles.pwdBtn}>
                    🔑 Password
                  </button>
                  <button onClick={() => handleDelete(u.id, u.name)} style={styles.delBtn}>Delete</button>
                </td>
              </tr>
            ))}
            {paginated.length === 0 && (
              <tr><td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: colors.muted }}>No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Password Reset Modal */}
      {pwdModal && (
        <div style={styles.modalOverlay} onClick={() => setPwdModal(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>🔑 Reset Password</h3>
            <p style={styles.modalSub}>Set a new password for <strong>{pwdModal.name}</strong></p>
            {pwdErr && <div style={styles.err}>{pwdErr}</div>}
            {pwdMsg && <div style={styles.success}>{pwdMsg}</div>}
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button onClick={handlePwdReset} style={styles.modalSaveBtn}>Update Password</button>
              <button onClick={() => setPwdModal(null)} style={styles.modalCancelBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const styles = {
  statsRow: { display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24 },
  statCard: { background: colors.surface, borderRadius: 10, padding: '16px 24px', boxShadow: shadows.panel, display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 140px' },
  statDot: { width: 12, height: 12, borderRadius: '50%', flexShrink: 0 },
  statNum: { fontSize: 28, fontWeight: 700, color: colors.dark, lineHeight: 1 },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  subtitle: { fontSize: 18, color: colors.dark, marginBottom: 0 },
  search: { padding: '9px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark, minWidth: 260 },
  table: { width: '100%', borderCollapse: 'collapse', background: colors.surface, borderRadius: 10, overflow: 'hidden', boxShadow: shadows.panel },
  th: { background: colors.primary, color: colors.surface, padding: '10px 16px', textAlign: 'left', fontSize: 13 },
  td: { padding: '10px 16px', borderBottom: `1px solid ${colors.light}`, fontSize: 14, verticalAlign: 'middle' },
  nameCell: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 },
  roleSelect: { padding: '5px 10px', borderRadius: 20, border: '1.5px solid', fontSize: 12, fontWeight: 600, background: 'transparent', cursor: 'pointer', outline: 'none' },
  pwdBtn: { background: `${colors.primary}15`, color: colors.primary, border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12, marginRight: 6 },
  delBtn: { background: `${colors.secondary}15`, color: colors.secondary, border: 'none', padding: '5px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 12 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: colors.surface, borderRadius: 12, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  modalTitle: { fontSize: 18, color: colors.dark, marginBottom: 6 },
  modalSub: { fontSize: 14, color: colors.muted, marginBottom: 20 },
  modalInput: { width: '100%', padding: '11px 14px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark, marginBottom: 16, boxSizing: 'border-box' },
  modalActions: { display: 'flex', gap: 10 },
  modalSaveBtn: { flex: 1, background: colors.primary, color: '#fff', border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  modalCancelBtn: { flex: 1, background: colors.light, color: colors.dark, border: 'none', padding: '10px', borderRadius: 6, cursor: 'pointer', fontSize: 14 },
  err: { background: 'rgba(228,58,25,0.1)', color: colors.secondary, padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
  success: { background: 'rgba(16,185,129,0.1)', color: '#065f46', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginBottom: 12 },
};
