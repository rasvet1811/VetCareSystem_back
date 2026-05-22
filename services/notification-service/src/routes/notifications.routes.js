const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const { send, getAll } = require('../controllers/notifications.controller');

router.post('/send', authMiddleware, send);
router.get('/', authMiddleware, getAll);

module.exports = router;
