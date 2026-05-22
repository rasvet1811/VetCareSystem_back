const db = require('../db');

async function getAll(req, res) {
  const { pet_id, status, type } = req.query;

  try {
    let query = `
      SELECT r.*, p.name as pet_name, p.species as pet_species
      FROM reminders r
      JOIN pets p ON r.pet_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'dueno') {
      params.push(req.user.id);
      query += ` AND p.owner_id = $${params.length}`;
    }

    if (pet_id) {
      params.push(pet_id);
      query += ` AND r.pet_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND r.status = $${params.length}`;
    }

    if (type) {
      params.push(type);
      query += ` AND r.type = $${params.length}`;
    }

    query += ' ORDER BY r.due_date ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener recordatorios' });
  }
}

async function getById(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT r.*, p.name as pet_name, p.owner_id
       FROM reminders r JOIN pets p ON r.pet_id = p.id
       WHERE r.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Recordatorio no encontrado' });

    const reminder = result.rows[0];
    if (req.user.role === 'dueno' && reminder.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a este recordatorio' });
    }
    res.json(reminder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener recordatorio' });
  }
}

async function create(req, res) {
  const { pet_id, type, description, due_date, owner_id } = req.body;

  if (!pet_id || !type || !description || !due_date) {
    return res.status(400).json({ error: 'pet_id, type, description y due_date son requeridos' });
  }

  const validTypes = ['vacuna', 'control', 'tratamiento', 'otro'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Tipo inválido. Use: ${validTypes.join(', ')}` });
  }

  try {
    const result = await db.query(
      `INSERT INTO reminders (pet_id, owner_id, type, description, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pet_id, owner_id || null, type, description, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear recordatorio' });
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { type, description, due_date, status } = req.body;

  const validStatuses = ['pendiente', 'completado', 'cancelado'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: `Estado inválido. Use: ${validStatuses.join(', ')}` });
  }

  try {
    const existing = await db.query('SELECT * FROM reminders WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Recordatorio no encontrado' });

    const r = existing.rows[0];
    const result = await db.query(
      `UPDATE reminders SET type=$1, description=$2, due_date=$3, status=$4, updated_at=NOW()
       WHERE id=$5 RETURNING *`,
      [type || r.type, description || r.description, due_date || r.due_date, status || r.status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar recordatorio' });
  }
}

async function remove(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM reminders WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Recordatorio no encontrado' });
    res.json({ message: 'Recordatorio eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar recordatorio' });
  }
}

module.exports = { getAll, getById, create, update, remove };
