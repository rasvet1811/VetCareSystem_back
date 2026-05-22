const router = require('express').Router();
const { authMiddleware, rbac } = require('../middleware/auth');
const { getAll, getById, create, update } = require('../controllers/pets.controller');
const { getRecords, createRecord, getVaccinations, addVaccination } = require('../controllers/records.controller');

router.get('/', authMiddleware, getAll);
router.post('/', authMiddleware, create);
router.get('/:id', authMiddleware, getById);
router.put('/:id', authMiddleware, update);

router.get('/:id/records', authMiddleware, getRecords);
router.post('/:id/records', authMiddleware, rbac('veterinario', 'administrador'), createRecord);

router.get('/:id/vaccinations', authMiddleware, getVaccinations);
router.post('/:id/vaccinations', authMiddleware, rbac('veterinario', 'administrador'), addVaccination);

module.exports = router;
