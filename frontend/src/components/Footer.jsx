export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.brand}>🎓 CertSystem</div>
        <div style={styles.text}>
          Dynamic Certificate Generation & Verification System — PERN Stack
        </div>
        <div style={styles.text}>© {new Date().getFullYear()} All rights reserved.</div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: '#1e3a8a', color: '#cbd5e1', padding: '20px 32px', marginTop: 'auto' },
  inner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  brand: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  text: { fontSize: 13 },
};
