import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCourses, enrollCourse } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);

  useEffect(() => {
    getCourses().then(r => setCourses(r.data)).finally(() => setLoading(false));
  }, []);

  const handleEnroll = async (courseId) => {
    if (!user) return navigate('/login');
    setEnrolling(courseId);
    try {
      await enrollCourse(courseId);
      navigate(`/courses/${courseId}/learn`);
    } catch {
      navigate(`/courses/${courseId}/learn`);
    } finally {
      setEnrolling(null);
    }
  };

  const typeIcon = (count) => count > 0 ? `${count} lesson${count > 1 ? 's' : ''}` : 'No lessons yet';

  if (loading) return <div style={styles.loading}>Loading courses...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Available Courses</h1>
        <p style={styles.sub}>Complete a course to earn your certificate automatically.</p>
      </div>

      {courses.length === 0 ? (
        <div style={styles.empty}>No courses available yet.</div>
      ) : (
        <div className="card-grid" style={styles.grid}>
          {courses.map(c => (
            <div key={c.id} style={styles.card}>
              <div style={styles.cardTop}>
                <span style={styles.categoryBadge}>{c.category_name || 'General'}</span>
                <span style={styles.lessonCount}>{typeIcon(parseInt(c.lesson_count))}</span>
              </div>
              <h3 style={styles.cardTitle}>{c.title}</h3>
              <p style={styles.cardDesc}>{c.description || 'No description provided.'}</p>
              {c.certificate_type_name && (
                <div style={styles.certBadge}>
                  🎓 Earns: {c.certificate_type_name}
                </div>
              )}
              <div style={styles.cardActions}>
                <button
                  style={styles.enrollBtn}
                  onClick={() => handleEnroll(c.id)}
                  disabled={enrolling === c.id}
                >
                  {enrolling === c.id ? 'Enrolling...' : 'Start Course'}
                </button>
                <Link to={`/courses/${c.id}/learn`} style={styles.previewLink}>Preview</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  loading: { textAlign: 'center', padding: 60, color: colors.muted },
  header: { marginBottom: 36, textAlign: 'center' },
  title: { fontSize: 28, fontWeight: 800, color: colors.dark, marginBottom: 8 },
  sub: { color: colors.muted, fontSize: 15 },
  empty: { textAlign: 'center', padding: 60, color: colors.muted, background: colors.surface, borderRadius: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 },
  card: { background: colors.surface, borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 10 },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { background: `${colors.primary}18`, color: colors.primary, fontSize: 12, padding: '3px 10px', borderRadius: 20, fontWeight: 600 },
  lessonCount: { fontSize: 12, color: colors.muted },
  cardTitle: { fontSize: 17, fontWeight: 700, color: colors.dark, margin: 0 },
  cardDesc: { fontSize: 13, color: colors.muted, lineHeight: 1.6, margin: 0, flex: 1 },
  certBadge: { background: 'rgba(40,167,69,0.1)', color: '#1b6f35', fontSize: 12, padding: '5px 10px', borderRadius: 6, fontWeight: 500 },
  cardActions: { display: 'flex', gap: 10, marginTop: 4 },
  enrollBtn: { background: colors.primary, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', flex: 1 },
  previewLink: { background: colors.light, color: colors.dark, padding: '9px 14px', borderRadius: 6, fontSize: 14, textDecoration: 'none', textAlign: 'center' },
};
