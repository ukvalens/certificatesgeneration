const express = require('express');
const router = express.Router();
const controller = require('../controllers/certificatesController');

router.get('/', controller.getAll);
router.get('/verify/:code', controller.verify);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.get('/:id/download', controller.download);
router.delete('/:id', controller.remove);

module.exports = router;
