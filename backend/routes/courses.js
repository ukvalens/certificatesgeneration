const router = require('express').Router();
const { auth } = require('../middleware/auth');
const c = require('../controllers/coursesController');

router.get('/', c.getAll);
router.get('/my-enrollments', auth, c.getMyEnrollments);
router.get('/:id', c.getOne);
router.post('/', auth, c.create);
router.put('/:id', auth, c.update);
router.delete('/:id', auth, c.remove);

router.post('/:course_id/lessons', auth, c.createLesson);
router.put('/:course_id/lessons/:lesson_id', auth, c.updateLesson);
router.delete('/:course_id/lessons/:lesson_id', auth, c.deleteLesson);

router.post('/:id/enroll', auth, c.enroll);
router.post('/lessons/:lesson_id/complete', auth, c.completeLesson);
router.get('/:id/progress', auth, c.getLessonProgress);

module.exports = router;
