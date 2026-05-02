import { colors } from '../theme';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="footer-inner" style={styles.inner}>
        <div style={styles.brand}>
          <i className="fa-solid fa-graduation-cap" style={{ marginRight: 8 }}></i>
          CertSystem
        </div>

        <div style={styles.description}>
          Need certificate? reach out at
          <a href="mailto:ukwitegetsev9@gmail.com" style={styles.link}>support@certsystem.com</a>.
        </div>

        <div style={styles.copy}>
          <i className="fa-regular fa-copyright" style={{ marginRight: 5 }}></i>
          {new Date().getFullYear()} CertSystem. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: { background: colors.primary, color: colors.surface, padding: '20px 32px' },
  inner: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, maxWidth: 1100, margin: '0 auto' },
  brand: { color: colors.surface, fontWeight: 'bold', fontSize: 16 },
  description: { fontSize: 14, color: 'rgba(255,255,255,0.9)', minWidth: 200, lineHeight: 1.5 },
  link: { color: colors.surface, textDecoration: 'underline', marginLeft: 4 },
  copy: { fontSize: 13 },
};
