import { colors } from '../theme';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div style={styles.wrap}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1} style={styles.btn}>‹ Prev</button>
      {pages.map(p => (
        <button key={p} onClick={() => onChange(p)} style={{ ...styles.btn, ...(p === page ? styles.active : {}) }}>{p}</button>
      ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} style={styles.btn}>Next ›</button>
    </div>
  );
}

const styles = {
  wrap: { display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center', marginTop: 20, flexWrap: 'wrap' },
  btn: { background: '#fff', color: colors.dark, border: `1px solid ${colors.border}`, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 13, minWidth: 36 },
  active: { background: colors.primary, color: '#fff', border: `1px solid ${colors.primary}`, fontWeight: 'bold' },
};
