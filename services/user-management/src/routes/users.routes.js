const router = require('express').Router();
const { authMiddleware, rbac } = require('../middleware/auth');
const { getAll, getById, update } = require('../controllers/users.controller');

router.get('/', authMiddleware, rbac('administrador'), getAll);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);

module.exports = router;
