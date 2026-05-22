const db = require('../db');

async function getAll(req, res) {
  try {
    let result;
    if (req.user.role === 'dueno') {
      result = await db.query(
        'SELECT p.*, u.name as owner_name FROM pets p JOIN users u ON p.owner_id = u.id WHERE p.owner_id = $1 ORDER BY p.created_at DESC',
        [req.user.id]
      );
    } else {
      result = await db.query(
        'SELECT p.*, u.name as owner_name FROM pets p JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC'
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mascotas' });
  }
}

async function getById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT p.*, u.name as owner_name, u.email as owner_email FROM pets p JOIN users u ON p.owner_id = u.id WHERE p.id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Mascota no encontrada' });

    const pet = result.rows[0];
    if (req.user.role === 'dueno' && pet.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta mascota' });
    }
    res.json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mascota' });
  }
}

async function create(req, res) {
  const { name, species, breed, birth_date, gender, weight, color, owner_id } = req.body;

  if (!name || !species) return res.status(400).json({ error: 'name y species son requeridos' });

  const ownerId = req.user.role === 'dueno' ? req.user.id : (owner_id || req.user.id);

  try {
    const result = await db.query(
      'INSERT INTO pets (owner_id, name, species, breed, birth_date, gender, weight, color) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [ownerId, name, species, breed || null, birth_date || null, gender || null, weight || null, color || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear mascota' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { name, species, breed, birth_date, gender, weight, color } = req.body;

  try {
    const existing = await db.query('SELECT * FROM pets WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Mascota no encontrada' });

    if (req.user.role === 'dueno' && existing.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a esta mascota' });
    }

    const result = await db.query(
      'UPDATE pets SET name=$1, species=$2, breed=$3, birth_date=$4, gender=$5, weight=$6, color=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, species, breed || null, birth_date || null, gender || null, weight || null, color || null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
}

module.exports = { getAll, getById, create, update };
