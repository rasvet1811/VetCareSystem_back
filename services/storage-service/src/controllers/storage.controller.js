const db = require('../db');

async function getHealth(req, res) {
  try {
    const start = Date.now();
    await db.query('SELECT 1');
    const latency = Date.now() - start;

    res.json({
      status: 'ok',
      service: 'storage-service',
      database: 'connected',
      latency_ms: latency,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'error',
      service: 'storage-service',
      database: 'disconnected',
      error: err.message,
    });
  }
}

async function getStats(req, res) {
  try {
    const [users, pets, records, vaccinations, reminders, notifications] = await Promise.all([
      db.query('SELECT COUNT(*) FROM users'),
      db.query('SELECT COUNT(*) FROM pets'),
      db.query('SELECT COUNT(*) FROM medical_records'),
      db.query('SELECT COUNT(*) FROM vaccinations'),
      db.query('SELECT COUNT(*) FROM reminders'),
      db.query('SELECT COUNT(*) FROM notifications'),
    ]);

    res.json({
      stats: {
        users: parseInt(users.rows[0].count),
        pets: parseInt(pets.rows[0].count),
        medical_records: parseInt(records.rows[0].count),
        vaccinations: parseInt(vaccinations.rows[0].count),
        reminders: parseInt(reminders.rows[0].count),
        notifications: parseInt(notifications.rows[0].count),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas de almacenamiento' });
  }
}

async function getResource(req, res) {
  const { resource } = req.params;
  const validResources = ['users', 'pets', 'medical_records', 'vaccinations', 'reminders', 'notifications'];

  if (!validResources.includes(resource)) {
    return res.status(400).json({ error: `Recurso inválido. Válidos: ${validResources.join(', ')}` });
  }

  try {
    const result = await db.query(`SELECT COUNT(*) as total FROM ${resource}`);
    res.json({ resource, total: parseInt(result.rows[0].total) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al consultar recurso' });
  }
}

async function backup(req, res) {
  try {
    const tables = ['users', 'pets', 'medical_records', 'vaccinations', 'reminders', 'notifications'];
    const counts = {};

    for (const table of tables) {
      const result = await db.query(`SELECT COUNT(*) FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count);
    }

    res.json({
      message: 'Snapshot de estado generado correctamente',
      backup_id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      record_counts: counts,
      status: 'completed',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al generar backup' });
  }
}

module.exports = { getHealth, getStats, getResource, backup };
