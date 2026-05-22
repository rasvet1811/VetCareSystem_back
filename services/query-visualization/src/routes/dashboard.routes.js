const router = require('express').Router();
const { authMiddleware, rbac } = require('../middleware/auth');
const { getPetDashboard, getSystemSummary, getPetsReport } = require('../controllers/dashboard.controller');

router.get('/summary', authMiddleware, rbac('veterinario', 'administrador'), getSystemSummary);
router.get('/pets', authMiddleware, getPetsReport);
router.get('/:petId', authMiddleware, getPetDashboard);

module.exports = router;
