import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse, enrollCourse, completeLesson, getLessonProgress } from '../api';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

export default function CourseLearn() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getCourse(id).then(r => setCourse(r.data));
    getLessonProgress(id).then(r => setCompletedIds(r.data)).catch(() => {});
  }, [id, user]);

  const lesson = course?.lessons?.[activeIdx];
  const totalLessons = course?.lessons?.length || 0;
  const progress = totalLessons ? Math.round((completedIds.length / totalLessons) * 100) : 0;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const markComplete = async () => {
    if (!lesson || completedIds.includes(lesson.id)) return;
    setFinishing(true);
    try {
      const res = await completeLesson(lesson.id);
      setCompletedIds(prev => [...prev, lesson.id]);
      if (res.data.certificate_issued) {
        showToast('🎓 Course complete! Your certificate has been issued.');
      } else if (res.data.message?.includes('completed')) {
        showToast('✅ Course complete!');
      } else {
        showToast('✅ Lesson marked complete.');
      }
      if (activeIdx < totalLessons - 1) setActiveIdx(i => i + 1);
    } catch (e) {
      showToast(e.response?.data?.error || 'Error saving progress.');
    } finally {
      setFinishing(false);
    }
  };

  const submitQuiz = () => {
    const questions = lesson.quiz_data?.questions || [];
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) correct++;
    });
    const passed = correct >= Math.ceil(questions.length * 0.6);
    setQuizResult({ correct, total: questions.length, passed });
    if (passed) markComplete();
  };

  if (!course) return <div style={styles.loading}>Loading course...</div>;
  if (!totalLessons) return (
    <div style={styles.page}>
      <div style={styles.emptyLessons}>
        <h2>{course.title}</h2>
        <p style={{ color: colors.muted }}>No lessons available yet. Check back soon!</p>
        <button style={styles.backBtn} onClick={() => navigate('/courses')}>← Back to Courses</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      {toast && <div style={styles.toast}>{toast}</div>}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/courses')}>← Courses</button>
        <div style={styles.headerCenter}>
          <h2 style={styles.courseTitle}>{course.title}</h2>
          {course.certificate_type_name && (
            <span style={styles.certBadge}>🎓 Earns: {course.certificate_type_name}</span>
          )}
        </div>
        <div style={styles.progressWrap}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>
          <span style={styles.progressLabel}>{progress}% complete</span>
        </div>
      </div>

      <div style={styles.body}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {course.lessons.map((l, i) => (
            <button
              key={l.id}
              style={{ ...styles.lessonBtn, ...(i === activeIdx ? styles.lessonBtnActive : {}), ...(completedIds.includes(l.id) ? styles.lessonBtnDone : {}) }}
              onClick={() => { setActiveIdx(i); setQuizAnswers({}); setQuizResult(null); }}
            >
              <span style={styles.lessonIcon}>
                {completedIds.includes(l.id) ? '✅' : l.lesson_type === 'video' ? '▶️' : l.lesson_type === 'quiz' ? '📝' : '📖'}
              </span>
              <span style={styles.lessonLabel}>{l.title}</span>
              <span style={styles.lessonType}>{l.lesson_type}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.lessonHeader}>
            <h3 style={styles.lessonTitle}>{lesson.title}</h3>
            <span style={styles.typePill}>{lesson.lesson_type}</span>
          </div>

          {/* VIDEO */}
          {lesson.lesson_type === 'video' && (
            <div style={styles.videoWrap}>
              {lesson.video_url ? (
                <iframe
                  src={lesson.video_url.replace('watch?v=', 'embed/')}
                  style={styles.iframe}
                  allowFullScreen
                  title={lesson.title}
                />
              ) : (
                <div style={styles.noMedia}>No video URL provided.</div>
              )}
              {lesson.content && <div style={styles.readingContent}>{lesson.content}</div>}
            </div>
          )}

          {/* READING */}
          {lesson.lesson_type === 'reading' && (
            <div style={styles.readingContent}>
              {lesson.content ? (
                lesson.content.split('\n').map((p, i) => p.trim() ? <p key={i} style={{ marginBottom: 12 }}>{p}</p> : <br key={i} />)
              ) : (
                <p style={{ color: colors.muted }}>No reading content provided.</p>
              )}
            </div>
          )}

          {/* QUIZ */}
          {lesson.lesson_type === 'quiz' && (
            <div style={styles.quiz}>
              {(lesson.quiz_data?.questions || []).length === 0 ? (
                <p style={{ color: colors.muted }}>No quiz questions yet.</p>
              ) : (
                <>
                  {lesson.quiz_data.questions.map((q, qi) => (
                    <div key={qi} style={styles.question}>
                      <p style={styles.questionText}>{qi + 1}. {q.question}</p>
                      <div style={styles.options}>
                        {q.options.map((opt, oi) => (
                          <label key={oi} style={{ ...styles.option, ...(quizAnswers[qi] === oi ? styles.optionSelected : {}) }}>
                            <input
                              type="radio"
                              name={`q${qi}`}
                              checked={quizAnswers[qi] === oi}
                              onChange={() => setQuizAnswers(a => ({ ...a, [qi]: oi }))}
                              style={{ marginRight: 8 }}
                              disabled={!!quizResult}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  {quizResult ? (
                    <div style={{ ...styles.quizResult, background: quizResult.passed ? 'rgba(40,167,69,0.1)' : 'rgba(228,58,25,0.1)', color: quizResult.passed ? '#1b6f35' : colors.secondary }}>
                      {quizResult.passed ? '🎉 Passed!' : '❌ Not passed.'} {quizResult.correct}/{quizResult.total} correct.
                      {!quizResult.passed && (
                        <button style={styles.retryBtn} onClick={() => { setQuizAnswers({}); setQuizResult(null); }}>Retry</button>
                      )}
                    </div>
                  ) : (
                    <button
                      style={styles.submitQuizBtn}
                      onClick={submitQuiz}
                      disabled={Object.keys(quizAnswers).length < (lesson.quiz_data?.questions?.length || 0)}
                    >
                      Submit Quiz
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Complete button (not for quiz — quiz auto-completes on pass) */}
          {lesson.lesson_type !== 'quiz' && (
            <button
              style={{ ...styles.completeBtn, ...(completedIds.includes(lesson.id) ? styles.completeBtnDone : {}) }}
              onClick={markComplete}
              disabled={completedIds.includes(lesson.id) || finishing}
            >
              {completedIds.includes(lesson.id) ? '✅ Completed' : finishing ? 'Saving...' : 'Mark as Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: colors.light },
  loading: { textAlign: 'center', padding: 80, color: colors.muted },
  emptyLessons: { maxWidth: 500, margin: '80px auto', textAlign: 'center', background: colors.surface, borderRadius: 12, padding: 40 },
  toast: { position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: colors.dark, color: '#fff', padding: '12px 24px', borderRadius: 8, zIndex: 9999, fontSize: 14, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' },
  header: { background: colors.primary, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
  backBtn: { background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap' },
  headerCenter: { flex: 1, minWidth: 0 },
  courseTitle: { color: '#fff', fontSize: 18, fontWeight: 700, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  certBadge: { background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 12, padding: '2px 10px', borderRadius: 20, marginTop: 4, display: 'inline-block' },
  progressWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, minWidth: 120 },
  progressBar: { width: 120, height: 6, background: 'rgba(255,255,255,0.25)', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', background: '#4ade80', borderRadius: 3, transition: 'width 0.4s' },
  progressLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  body: { display: 'flex', minHeight: 'calc(100vh - 70px)' },
  sidebar: { width: 260, flexShrink: 0, background: colors.surface, borderRight: `1px solid ${colors.light}`, padding: '16px 0', overflowY: 'auto' },
  lessonBtn: { width: '100%', background: 'none', border: 'none', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', borderLeft: '3px solid transparent' },
  lessonBtnActive: { background: `${colors.primary}12`, borderLeftColor: colors.primary },
  lessonBtnDone: { opacity: 0.7 },
  lessonIcon: { fontSize: 16, flexShrink: 0 },
  lessonLabel: { flex: 1, fontSize: 13, color: colors.dark, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  lessonType: { fontSize: 10, color: colors.muted, textTransform: 'uppercase', flexShrink: 0 },
  content: { flex: 1, padding: '32px 40px', overflowY: 'auto', maxWidth: 800 },
  lessonHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  lessonTitle: { fontSize: 22, fontWeight: 700, color: colors.dark, margin: 0 },
  typePill: { background: `${colors.primary}18`, color: colors.primary, fontSize: 11, padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', fontWeight: 600 },
  videoWrap: { marginBottom: 24 },
  iframe: { width: '100%', height: 400, border: 'none', borderRadius: 8, marginBottom: 16 },
  noMedia: { background: colors.light, borderRadius: 8, padding: 40, textAlign: 'center', color: colors.muted },
  readingContent: { fontSize: 15, color: colors.dark, lineHeight: 1.8, background: colors.surface, borderRadius: 8, padding: 24 },
  quiz: { display: 'flex', flexDirection: 'column', gap: 24 },
  question: { background: colors.surface, borderRadius: 8, padding: 20 },
  questionText: { fontWeight: 600, color: colors.dark, marginBottom: 12, fontSize: 15 },
  options: { display: 'flex', flexDirection: 'column', gap: 8 },
  option: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 6, border: `1px solid ${colors.light}`, cursor: 'pointer', fontSize: 14, color: colors.dark },
  optionSelected: { background: `${colors.primary}12`, borderColor: colors.primary },
  quizResult: { padding: '14px 20px', borderRadius: 8, fontWeight: 600, fontSize: 15, display: 'flex', alignItems: 'center', gap: 12 },
  retryBtn: { background: colors.secondary, color: '#fff', border: 'none', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginLeft: 'auto' },
  submitQuizBtn: { background: colors.primary, color: '#fff', border: 'none', padding: '11px 24px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' },
  completeBtn: { marginTop: 24, background: colors.primary, color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  completeBtnDone: { background: '#4ade80', color: '#1b6f35', cursor: 'default' },
};
