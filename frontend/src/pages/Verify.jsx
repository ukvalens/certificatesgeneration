import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyCertificate } from '../api';

import { colors, shadows } from '../theme';

export default function Verify() {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(paramCode || '');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    verifyCertificate(code.trim())
      .then(r => { setResult(r.data); navigate(`/verify/${code.trim()}`, { replace: true }); })
      .catch(() => setError('Certificate not found. Please check the code and try again.'))
      .finally(() => setLoading(false));
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <h1 style={styles.title}>🔍 Verify Certificate</h1>
        <p style={styles.desc}>Enter a certificate code or scan a QR code to verify authenticity.</p>
        <div style={styles.form}>
          <input
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
            placeholder="e.g. CERT-A1B2C3D4"
            style={styles.input}
          />
          <button onClick={handleVerify} style={styles.btn} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {result && (
          <div style={styles.result}>
            <div style={styles.badge}>✅ Certificate Verified</div>
            <div style={styles.grid}>
              <Field label="Recipient" value={result.user_name} />
              <Field label="Email" value={result.email || '—'} />
              <Field label="Certificate Type" value={result.certificate_type} />
              <Field label="Course" value={result.category || '—'} />
              <Field label="Issue Date" value={new Date(result.issue_date).toLocaleDateString()} />
              <Field label="Certificate Code" value={result.certificate_code} mono />
            </div>
            {result.qr_code && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <img src={result.qr_code} alt="QR Code" style={{ width: 120 }} />
                <p style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>QR Code</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit' }}>{value}</div>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, background: colors.light },
  box: { background: colors.surface, borderRadius: 12, padding: 40, boxShadow: shadows.panel, width: '100%', maxWidth: 560 },
  title: { fontSize: 26, color: colors.dark, marginBottom: 8 },
  desc: { color: colors.muted, marginBottom: 24, fontSize: 14 },
  form: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { flex: 1, padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 15, color: colors.dark },
  btn: { background: colors.primary, color: colors.surface, border: 'none', padding: '12px 24px', borderRadius: 6, cursor: 'pointer', fontSize: 15 },
  error: { background: 'rgba(228, 58, 25, 0.12)', color: colors.secondary, padding: '12px 16px', borderRadius: 6, fontSize: 14 },
  result: { background: 'rgba(17, 31, 77, 0.08)', border: `1px solid ${colors.primary}`, borderRadius: 8, padding: 24, marginTop: 16 },
  badge: { color: colors.secondary, fontWeight: 'bold', fontSize: 16, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' },
};
