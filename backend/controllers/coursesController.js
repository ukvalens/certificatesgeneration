const pool = require('../db');
const { generateCertificateCode, generateQRCode, generatePDF } = require('../utils/pdfGenerator');
const { sendMail } = require('../utils/mailer');

// ── Courses ──────────────────────────────────────────────
const getAll = async (req, res) => {
  const result = await pool.query(`
    SELECT c.*, cat.name AS category_name, ct.name AS certificate_type_name,
      (SELECT COUNT(*) FROM course_lessons WHERE course_id = c.id) AS lesson_count
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    ORDER BY c.created_at DESC
  `);
  res.json(result.rows);
};

const getOne = async (req, res) => {
  const { id } = req.params;
  const course = await pool.query(`
    SELECT c.*, cat.name AS category_name, ct.name AS certificate_type_name
    FROM courses c
    LEFT JOIN categories cat ON c.category_id = cat.id
    LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
    WHERE c.id = $1
  `, [id]);
  if (!course.rows.length) return res.status(404).json({ error: 'Course not found' });

  const lessons = await pool.query(
    'SELECT * FROM course_lessons WHERE course_id = $1 ORDER BY position, id',
    [id]
  );
  res.json({ ...course.rows[0], lessons: lessons.rows });
};

const create = async (req, res) => {
  const { title, description, category_id, certificate_type_id } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });
  const result = await pool.query(
    'INSERT INTO courses (title, description, category_id, certificate_type_id) VALUES ($1,$2,$3,$4) RETURNING *',
    [title, description || null, category_id || null, certificate_type_id || null]
  );
  res.status(201).json(result.rows[0]);
};

const update = async (req, res) => {
  const { id } = req.params;
  const { title, description, category_id, certificate_type_id } = req.body;
  const result = await pool.query(
    'UPDATE courses SET title=$1, description=$2, category_id=$3, certificate_type_id=$4 WHERE id=$5 RETURNING *',
    [title, description || null, category_id || null, certificate_type_id || null, id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
};

const remove = async (req, res) => {
  await pool.query('DELETE FROM courses WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
};

// ── Lessons ──────────────────────────────────────────────
const createLesson = async (req, res) => {
  const { course_id } = req.params;
  const { title, lesson_type, content, video_url, quiz_data, position } = req.body;
  if (!title || !lesson_type) return res.status(400).json({ error: 'title and lesson_type required' });
  const result = await pool.query(
    'INSERT INTO course_lessons (course_id, title, lesson_type, content, video_url, quiz_data, position) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
    [course_id, title, lesson_type, content || null, video_url || null, quiz_data ? JSON.stringify(quiz_data) : null, position || 0]
  );
  res.status(201).json(result.rows[0]);
};

const updateLesson = async (req, res) => {
  const { lesson_id } = req.params;
  const { title, lesson_type, content, video_url, quiz_data, position } = req.body;
  const result = await pool.query(
    'UPDATE course_lessons SET title=$1, lesson_type=$2, content=$3, video_url=$4, quiz_data=$5, position=$6 WHERE id=$7 RETURNING *',
    [title, lesson_type, content || null, video_url || null, quiz_data ? JSON.stringify(quiz_data) : null, position || 0, lesson_id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(result.rows[0]);
};

const deleteLesson = async (req, res) => {
  await pool.query('DELETE FROM course_lessons WHERE id=$1', [req.params.lesson_id]);
  res.json({ message: 'Deleted' });
};

// ── Enrollment & Progress ─────────────────────────────────
const enroll = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  try {
    await pool.query(
      'INSERT INTO course_enrollments (user_id, course_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [user_id, id]
    );
    res.json({ message: 'Enrolled' });
  } catch {
    res.status(400).json({ error: 'Already enrolled' });
  }
};

const getMyEnrollments = async (req, res) => {
  const user_id = req.user.id;
  const result = await pool.query(`
    SELECT e.*, c.title, c.description, cat.name AS category_name,
      (SELECT COUNT(*) FROM course_lessons WHERE course_id = c.id) AS total_lessons,
      (SELECT COUNT(*) FROM lesson_progress lp
        JOIN course_lessons cl ON lp.lesson_id = cl.id
        WHERE cl.course_id = c.id AND lp.user_id = $1) AS completed_lessons
    FROM course_enrollments e
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN categories cat ON c.category_id = cat.id
    WHERE e.user_id = $1
    ORDER BY e.enrolled_at DESC
  `, [user_id]);
  res.json(result.rows);
};

const completeLesson = async (req, res) => {
  const { lesson_id } = req.params;
  const user_id = req.user.id;

  await pool.query(
    'INSERT INTO lesson_progress (user_id, lesson_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
    [user_id, lesson_id]
  );

  // Check if all lessons in the course are done
  const lessonRow = await pool.query('SELECT course_id FROM course_lessons WHERE id=$1', [lesson_id]);
  if (!lessonRow.rows.length) return res.json({ message: 'Progress saved' });

  const course_id = lessonRow.rows[0].course_id;

  const { rows: [{ total }] } = await pool.query(
    'SELECT COUNT(*) AS total FROM course_lessons WHERE course_id=$1', [course_id]
  );
  const { rows: [{ done }] } = await pool.query(`
    SELECT COUNT(*) AS done FROM lesson_progress lp
    JOIN course_lessons cl ON lp.lesson_id = cl.id
    WHERE cl.course_id=$1 AND lp.user_id=$2
  `, [course_id, user_id]);

  if (parseInt(done) >= parseInt(total)) {
    // Mark enrollment complete
    await pool.query(
      'UPDATE course_enrollments SET completed_at=NOW() WHERE user_id=$1 AND course_id=$2 AND completed_at IS NULL',
      [user_id, course_id]
    );

    // Auto-issue certificate if course has one linked
    const courseRow = await pool.query(`
      SELECT c.*, ct.name AS cert_type_name, u.name AS user_name, u.email
      FROM courses c
      LEFT JOIN certificate_types ct ON c.certificate_type_id = ct.id
      JOIN users u ON u.id=$1
      WHERE c.id=$2
    `, [user_id, course_id]);

    const course = courseRow.rows[0];
    if (course?.certificate_type_id) {
      // Avoid duplicate cert
      const existing = await pool.query(
        `SELECT id FROM certificates WHERE email=$1 AND certificate_type_id=$2`,
        [course.email, course.certificate_type_id]
      );
      if (!existing.rows.length) {
        const certificate_code = generateCertificateCode();
        const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${certificate_code}`;
        const qr_code = await generateQRCode(verifyUrl);

        await pool.query(
          `INSERT INTO certificates (user_name, email, certificate_type_id, issue_date, certificate_code, qr_code, description)
           VALUES ($1,$2,$3,CURRENT_DATE,$4,$5,$6)`,
          [course.user_name, course.email, course.certificate_type_id, certificate_code, qr_code,
            `Awarded for completing the course: ${course.title}`]
        );

        if (course.email) {
          try {
            await sendMail({
              to: course.email,
              subject: `🎓 Certificate Issued: ${course.title}`,
              html: `<p>Hi ${course.user_name},</p><p>Congratulations on completing <strong>${course.title}</strong>! Your certificate is ready.</p><p>Verify it here: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
            });
          } catch (e) { console.error('Mail error:', e.message); }
        }

        return res.json({ message: 'Course completed! Certificate issued.', certificate_issued: true });
      }
    }
    return res.json({ message: 'Course completed!', certificate_issued: false });
  }

  res.json({ message: 'Progress saved', certificate_issued: false });
};

const getLessonProgress = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const result = await pool.query(`
    SELECT lp.lesson_id FROM lesson_progress lp
    JOIN course_lessons cl ON lp.lesson_id = cl.id
    WHERE cl.course_id=$1 AND lp.user_id=$2
  `, [id, user_id]);
  res.json(result.rows.map(r => r.lesson_id));
};

module.exports = { getAll, getOne, create, update, remove, createLesson, updateLesson, deleteLesson, enroll, getMyEnrollments, completeLesson, getLessonProgress };
