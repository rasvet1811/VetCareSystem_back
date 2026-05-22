const router = require('express').Router();
const { authMiddleware, rbac } = require('../middleware/auth');
const { getHealth, getStats, getResource, backup } = require('../controllers/storage.controller');

router.get('/health', getHealth);
router.get('/stats', authMiddleware, rbac('administrador'), getStats);
router.get('/backup', authMiddleware, rbac('administrador'), backup);
router.get('/:resource', authMiddleware, rbac('administrador'), getResource);

module.exports = router;
