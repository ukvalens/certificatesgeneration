import { useEffect, useState } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse, createLesson, updateLesson, deleteLesson, getCategories, getCertificateTypes } from '../api';
import DashboardLayout from '../components/DashboardLayout';
import { colors } from '../theme';

const LESSON_TYPES = ['video', 'reading', 'quiz'];

const emptyLesson = { title: '', lesson_type: 'reading', content: '', video_url: '', position: 0, quiz_data: { questions: [] } };
const emptyCourse = { title: '', description: '', category_id: '', certificate_type_id: '' };

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [certTypes, setCertTypes] = useState([]);
  const [form, setForm] = useState(emptyCourse);
  const [editId, setEditId] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [editLessonId, setEditLessonId] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => getCourses().then(r => setCourses(r.data));

  useEffect(() => {
    load();
    getCategories().then(r => setCategories(r.data));
    getCertificateTypes().then(r => setCertTypes(r.data));
  }, []);

  const saveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await updateCourse(editId, form);
      else await createCourse(form);
      setForm(emptyCourse); setEditId(null); load();
    } finally { setSaving(false); }
  };

  const removeCourse = async (id) => {
    if (!confirm('Delete this course and all its lessons?')) return;
    await deleteCourse(id); load();
  };

  const startEditCourse = (c) => {
    setEditId(c.id);
    setForm({ title: c.title, description: c.description || '', category_id: c.category_id || '', certificate_type_id: c.certificate_type_id || '' });
    window.scrollTo(0, 0);
  };

  const saveLesson = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...lessonForm };
      if (payload.lesson_type !== 'quiz') delete payload.quiz_data;
      if (payload.lesson_type !== 'video') delete payload.video_url;
      if (editLessonId) await updateLesson(expanded, editLessonId, payload);
      else await createLesson(expanded, payload);
      setLessonForm(emptyLesson); setEditLessonId(null); load();
    } finally { setSaving(false); }
  };

  const removeLesson = async (courseId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    await deleteLesson(courseId, lessonId); load();
  };

  const addQuizQuestion = () => {
    setLessonForm(f => ({
      ...f,
      quiz_data: { questions: [...(f.quiz_data?.questions || []), { question: '', options: ['', '', '', ''], answer: 0 }] }
    }));
  };

  const updateQuestion = (qi, field, val) => {
    setLessonForm(f => {
      const questions = [...f.quiz_data.questions];
      questions[qi] = { ...questions[qi], [field]: val };
      return { ...f, quiz_data: { questions } };
    });
  };

  const updateOption = (qi, oi, val) => {
    setLessonForm(f => {
      const questions = [...f.quiz_data.questions];
      const options = [...questions[qi].options];
      options[oi] = val;
      questions[qi] = { ...questions[qi], options };
      return { ...f, quiz_data: { questions } };
    });
  };

  const expandedCourse = courses.find(c => c.id === expanded);

  return (
    <DashboardLayout title="Course Management">
      {/* Course Form */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>{editId ? 'Edit Course' : 'New Course'}</h3>
        <form onSubmit={saveCourse} style={styles.form}>
          <input style={styles.input} placeholder="Course title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <textarea style={styles.textarea} placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          <div style={styles.row}>
            <select style={styles.select} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
              <option value="">-- Category --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select style={styles.select} value={form.certificate_type_id} onChange={e => setForm(f => ({ ...f, certificate_type_id: e.target.value }))}>
              <option value="">-- Certificate Type (optional) --</option>
              {certTypes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={styles.formActions}>
            <button style={styles.saveBtn} type="submit" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update Course' : 'Create Course'}</button>
            {editId && <button type="button" style={styles.cancelBtn} onClick={() => { setEditId(null); setForm(emptyCourse); }}>Cancel</button>}
          </div>
        </form>
      </div>

      {/* Course List */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>All Courses ({courses.length})</h3>
        {courses.map(c => (
          <div key={c.id} style={styles.courseCard}>
            <div style={styles.courseRow}>
              <div style={{ flex: 1 }}>
                <strong style={{ color: colors.dark }}>{c.title}</strong>
                <span style={styles.meta}> · {c.category_name || 'No category'} · {c.lesson_count} lessons</span>
                {c.certificate_type_name && <span style={styles.certTag}>🎓 {c.certificate_type_name}</span>}
              </div>
              <div style={styles.courseActions}>
                <button style={styles.editBtn} onClick={() => startEditCourse(c)}>Edit</button>
                <button style={styles.lessonsBtn} onClick={() => { setExpanded(expanded === c.id ? null : c.id); setLessonForm(emptyLesson); setEditLessonId(null); }}>
                  {expanded === c.id ? 'Hide Lessons' : 'Lessons'}
                </button>
                <button style={styles.deleteBtn} onClick={() => removeCourse(c.id)}>Delete</button>
              </div>
            </div>

            {/* Lessons Panel */}
            {expanded === c.id && (
              <div style={styles.lessonsPanel}>
                <h4 style={styles.lessonsPanelTitle}>Lessons for: {c.title}</h4>

                {/* Existing lessons */}
                {expandedCourse?.lessons?.length === 0 && <p style={{ color: colors.muted, fontSize: 13 }}>No lessons yet.</p>}
                {(expandedCourse?.lessons || []).map(l => (
                  <div key={l.id} style={styles.lessonRow}>
                    <span style={styles.lessonTypePill}>{l.lesson_type}</span>
                    <span style={{ flex: 1, fontSize: 13, color: colors.dark }}>{l.title}</span>
                    <button style={styles.editBtn} onClick={() => {
                      setEditLessonId(l.id);
                      setLessonForm({ title: l.title, lesson_type: l.lesson_type, content: l.content || '', video_url: l.video_url || '', position: l.position || 0, quiz_data: l.quiz_data || { questions: [] } });
                    }}>Edit</button>
                    <button style={styles.deleteBtn} onClick={() => removeLesson(c.id, l.id)}>Delete</button>
                  </div>
                ))}

                {/* Lesson Form */}
                <form onSubmit={saveLesson} style={{ ...styles.form, marginTop: 16 }}>
                  <h5 style={{ margin: '0 0 8px', color: colors.dark }}>{editLessonId ? 'Edit Lesson' : 'Add Lesson'}</h5>
                  <div style={styles.row}>
                    <input style={styles.input} placeholder="Lesson title *" value={lessonForm.title} onChange={e => setLessonForm(f => ({ ...f, title: e.target.value }))} required />
                    <select style={styles.select} value={lessonForm.lesson_type} onChange={e => setLessonForm(f => ({ ...f, lesson_type: e.target.value, quiz_data: { questions: [] } }))}>
                      {LESSON_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input style={{ ...styles.input, maxWidth: 80 }} type="number" placeholder="Order" value={lessonForm.position} onChange={e => setLessonForm(f => ({ ...f, position: parseInt(e.target.value) || 0 }))} />
                  </div>

                  {lessonForm.lesson_type === 'video' && (
                    <input style={styles.input} placeholder="YouTube URL (e.g. https://www.youtube.com/watch?v=...)" value={lessonForm.video_url} onChange={e => setLessonForm(f => ({ ...f, video_url: e.target.value }))} />
                  )}

                  {(lessonForm.lesson_type === 'reading' || lessonForm.lesson_type === 'video') && (
                    <textarea style={styles.textarea} placeholder="Content / notes" value={lessonForm.content} onChange={e => setLessonForm(f => ({ ...f, content: e.target.value }))} rows={5} />
                  )}

                  {lessonForm.lesson_type === 'quiz' && (
                    <div style={styles.quizBuilder}>
                      {(lessonForm.quiz_data?.questions || []).map((q, qi) => (
                        <div key={qi} style={styles.quizQuestion}>
                          <input style={styles.input} placeholder={`Question ${qi + 1}`} value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} />
                          {q.options.map((opt, oi) => (
                            <div key={oi} style={styles.optionRow}>
                              <input type="radio" name={`correct-${qi}`} checked={q.answer === oi} onChange={() => updateQuestion(qi, 'answer', oi)} />
                              <input style={{ ...styles.input, flex: 1 }} placeholder={`Option ${oi + 1}`} value={opt} onChange={e => updateOption(qi, oi, e.target.value)} />
                            </div>
                          ))}
                        </div>
                      ))}
                      <button type="button" style={styles.addQBtn} onClick={addQuizQuestion}>+ Add Question</button>
                    </div>
                  )}

                  <div style={styles.formActions}>
                    <button style={styles.saveBtn} type="submit" disabled={saving}>{saving ? 'Saving...' : editLessonId ? 'Update Lesson' : 'Add Lesson'}</button>
                    {editLessonId && <button type="button" style={styles.cancelBtn} onClick={() => { setEditLessonId(null); setLessonForm(emptyLesson); }}>Cancel</button>}
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

const styles = {
  section: { background: colors.surface, borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: colors.dark, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  input: { flex: 1, padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark, minWidth: 0, boxSizing: 'border-box' },
  textarea: { padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark, resize: 'vertical', fontFamily: 'inherit' },
  select: { flex: 1, padding: '9px 12px', border: `1px solid ${colors.border}`, borderRadius: 6, fontSize: 14, color: colors.dark, minWidth: 0 },
  formActions: { display: 'flex', gap: 10 },
  saveBtn: { background: colors.primary, color: '#fff', border: 'none', padding: '9px 20px', borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn: { background: colors.light, color: colors.dark, border: 'none', padding: '9px 16px', borderRadius: 6, fontSize: 14, cursor: 'pointer' },
  courseCard: { border: `1px solid ${colors.light}`, borderRadius: 8, marginBottom: 12, overflow: 'hidden' },
  courseRow: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', flexWrap: 'wrap' },
  meta: { color: colors.muted, fontSize: 13 },
  certTag: { background: 'rgba(40,167,69,0.1)', color: '#1b6f35', fontSize: 11, padding: '2px 8px', borderRadius: 10, marginLeft: 8 },
  courseActions: { display: 'flex', gap: 6 },
  editBtn: { background: `${colors.primary}18`, color: colors.primary, border: 'none', padding: '5px 12px', borderRadius: 5, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  lessonsBtn: { background: `${colors.primary}18`, color: colors.primary, border: 'none', padding: '5px 12px', borderRadius: 5, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  deleteBtn: { background: 'rgba(228,58,25,0.1)', color: colors.secondary, border: 'none', padding: '5px 12px', borderRadius: 5, fontSize: 12, cursor: 'pointer', fontWeight: 600 },
  lessonsPanel: { background: colors.light, padding: '16px 20px', borderTop: `1px solid ${colors.light}` },
  lessonsPanelTitle: { fontSize: 14, fontWeight: 700, color: colors.dark, marginBottom: 12 },
  lessonRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid rgba(0,0,0,0.05)` },
  lessonTypePill: { background: `${colors.primary}18`, color: colors.primary, fontSize: 11, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 },
  quizBuilder: { display: 'flex', flexDirection: 'column', gap: 12, background: colors.light, borderRadius: 8, padding: 16 },
  quizQuestion: { display: 'flex', flexDirection: 'column', gap: 6, background: colors.surface, borderRadius: 6, padding: 12 },
  optionRow: { display: 'flex', alignItems: 'center', gap: 8 },
  addQBtn: { background: colors.primary, color: '#fff', border: 'none', padding: '7px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' },
};
