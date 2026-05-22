const db = require('../db');

async function getRecords(req, res) {
  const { id: petId } = req.params;
  try {
    const pet = await db.query('SELECT * FROM pets WHERE id = $1', [petId]);
    if (pet.rows.length === 0) return res.status(404).json({ error: 'Mascota no encontrada' });

    if (req.user.role === 'dueno' && pet.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta mascota' });
    }

    const result = await db.query(
      `SELECT r.*, u.name as vet_name
       FROM medical_records r
       LEFT JOIN users u ON r.vet_id = u.id
       WHERE r.pet_id = $1
       ORDER BY r.date DESC`,
      [petId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial clínico' });
  }
}

async function createRecord(req, res) {
  const { id: petId } = req.params;
  const { reason, diagnosis, treatment, notes, weight, temperature } = req.body;

  try {
    const pet = await db.query('SELECT * FROM pets WHERE id = $1', [petId]);
    if (pet.rows.length === 0) return res.status(404).json({ error: 'Mascota no encontrada' });

    const result = await db.query(
      `INSERT INTO medical_records (pet_id, vet_id, reason, diagnosis, treatment, notes, weight, temperature)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [petId, req.user.id, reason || null, diagnosis || null, treatment || null, notes || null, weight || null, temperature || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar consulta médica' });
  }
}

async function getVaccinations(req, res) {
  const { id: petId } = req.params;
  try {
    const pet = await db.query('SELECT * FROM pets WHERE id = $1', [petId]);
    if (pet.rows.length === 0) return res.status(404).json({ error: 'Mascota no encontrada' });

    if (req.user.role === 'dueno' && pet.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta mascota' });
    }

    const result = await db.query(
      `SELECT v.*, u.name as vet_name
       FROM vaccinations v
       LEFT JOIN users u ON v.administered_by = u.id
       WHERE v.pet_id = $1
       ORDER BY v.date DESC`,
      [petId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener vacunas' });
  }
}

async function addVaccination(req, res) {
  const { id: petId } = req.params;
  const { vaccine_name, date, next_date, batch_number, notes } = req.body;

  if (!vaccine_name || !date) {
    return res.status(400).json({ error: 'vaccine_name y date son requeridos' });
  }

  try {
    const pet = await db.query('SELECT * FROM pets WHERE id = $1', [petId]);
    if (pet.rows.length === 0) return res.status(404).json({ error: 'Mascota no encontrada' });

    const result = await db.query(
      `INSERT INTO vaccinations (pet_id, vaccine_name, date, next_date, administered_by, batch_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [petId, vaccine_name, date, next_date || null, req.user.id, batch_number || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar vacuna' });
  }
}

module.exports = { getRecords, createRecord, getVaccinations, addVaccination };
