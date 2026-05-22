const router = require('express').Router();
const { authMiddleware, rbac } = require('../middleware/auth');
const { getAll, getById, update, changePassword } = require('../controllers/users.controller');

router.get('/', authMiddleware, rbac('administrador'), getAll);
router.put('/me/password', authMiddleware, changePassword);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);

module.exports = router;
