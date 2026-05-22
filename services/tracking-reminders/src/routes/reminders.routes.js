const router = require('express').Router();
const { authMiddleware, rbac } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/reminders.controller');

router.get('/', authMiddleware, getAll);
router.post('/', authMiddleware, create);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);
router.delete('/:id', authMiddleware, rbac('veterinario', 'administrador'), remove);

module.exports = router;
