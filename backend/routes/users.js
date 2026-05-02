const express = require('express');
const router = express.Router();
const { getAll, updateRole, adminResetPassword, remove } = require('../controllers/usersController');
const { auth, requireRole } = require('../middleware/auth');

router.use(auth, requireRole('admin'));

router.get('/', getAll);
router.put('/:id/role', updateRole);
router.put('/:id/password', adminResetPassword);
router.delete('/:id', remove);

module.exports = router;
