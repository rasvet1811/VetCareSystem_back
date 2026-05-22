const db = require('../db');

async function getPetDashboard(req, res) {
  const { petId } = req.params;

  try {
    const petResult = await db.query(
      `SELECT p.*, u.name as owner_name, u.email as owner_email, u.phone as owner_phone
       FROM pets p JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [petId]
    );

    if (petResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const pet = petResult.rows[0];

    if (req.user.role === 'dueno' && pet.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso al historial de esta mascota' });
    }

    const [records, vaccinations, reminders] = await Promise.all([
      db.query(
        `SELECT r.*, u.name as vet_name
         FROM medical_records r LEFT JOIN users u ON r.vet_id = u.id
         WHERE r.pet_id = $1 ORDER BY r.date DESC LIMIT 10`,
        [petId]
      ),
      db.query(
        `SELECT v.*, u.name as vet_name
         FROM vaccinations v LEFT JOIN users u ON v.administered_by = u.id
         WHERE v.pet_id = $1 ORDER BY v.date DESC`,
        [petId]
      ),
      db.query(
        `SELECT * FROM reminders WHERE pet_id = $1 ORDER BY due_date ASC`,
        [petId]
      ),
    ]);

    const pendingReminders = reminders.rows.filter(r => r.status === 'pendiente');
    const overdueReminders = pendingReminders.filter(r => new Date(r.due_date) < new Date());

    res.json({
      pet,
      summary: {
        total_records: records.rows.length,
        total_vaccinations: vaccinations.rows.length,
        pending_reminders: pendingReminders.length,
        overdue_reminders: overdueReminders.length,
      },
      recent_records: records.rows,
      vaccinations: vaccinations.rows,
      reminders: reminders.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard de mascota' });
  }
}

async function getSystemSummary(req, res) {
  try {
    const [
      usersCount,
      petsCount,
      recordsCount,
      vaccinationsCount,
      pendingReminders,
      overdueReminders,
      recentRecords,
    ] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM pets'),
      db.query('SELECT COUNT(*) FROM medical_records'),
      db.query('SELECT COUNT(*) FROM vaccinations'),
      db.query("SELECT COUNT(*) FROM reminders WHERE status = 'pendiente'"),
      db.query("SELECT COUNT(*) FROM reminders WHERE status = 'pendiente' AND due_date < NOW()"),
      db.query(`
        SELECT r.*, p.name as pet_name, u.name as vet_name
        FROM medical_records r
        JOIN pets p ON r.pet_id = p.id
        LEFT JOIN users u ON r.vet_id = u.id
        ORDER BY r.date DESC LIMIT 5
      `),
    ]);

    res.json({
      summary: {
        total_users: parseInt(usersCount.rows[0].count),
        total_pets: parseInt(petsCount.rows[0].count),
        total_records: parseInt(recordsCount.rows[0].count),
        total_vaccinations: parseInt(vaccinationsCount.rows[0].count),
        pending_reminders: parseInt(pendingReminders.rows[0].count),
        overdue_reminders: parseInt(overdueReminders.rows[0].count),
      },
      recent_records: recentRecords.rows,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener resumen del sistema' });
  }
}

async function getPetsReport(req, res) {
  try {
    let query = `
      SELECT
        p.*,
        u.name as owner_name,
        u.email as owner_email,
        COUNT(DISTINCT r.id) as total_records,
        COUNT(DISTINCT v.id) as total_vaccinations,
        COUNT(DISTINCT rem.id) FILTER (WHERE rem.status = 'pendiente') as pending_reminders,
        MAX(r.date) as last_visit
      FROM pets p
      JOIN users u ON p.owner_id = u.id
      LEFT JOIN medical_records r ON r.pet_id = p.id
      LEFT JOIN vaccinations v ON v.pet_id = p.id
      LEFT JOIN reminders rem ON rem.pet_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'dueno') {
      params.push(req.user.id);
      query += ` AND p.owner_id = $${params.length}`;
    }

    query += ' GROUP BY p.id, u.name, u.email ORDER BY p.name';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar reporte de mascotas' });
  }
}

module.exports = { getPetDashboard, getSystemSummary, getPetsReport };
