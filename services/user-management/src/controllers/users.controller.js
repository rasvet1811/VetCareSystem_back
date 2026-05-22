const db = require('../db');

async function getAll(req, res) {
  try {
    const result = await db.query(
      'SELECT id, email, role, name, phone, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  if (req.user.role !== 'administrador' && req.user.id !== id) {
    return res.status(403).json({ error: 'Solo puedes consultar tu propio perfil' });
  }

  try {
    const result = await db.query(
      'SELECT id, email, role, name, phone, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
}

async function update(req, res) {
  const { id } = req.params;

  if (req.user.role !== 'administrador' && req.user.id !== id) {
    return res.status(403).json({ error: 'Solo puedes modificar tu propio perfil' });
  }

  const { name, phone } = req.body;
  if (!name) return res.status(400).json({ error: 'name es requerido' });

  try {
    const result = await db.query(
      'UPDATE users SET name = $1, phone = $2, updated_at = NOW() WHERE id = $3 RETURNING id, email, role, name, phone',
      [name, phone || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
}

module.exports = { getAll, getById, update };
