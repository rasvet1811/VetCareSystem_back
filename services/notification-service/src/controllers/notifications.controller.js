const nodemailer = require('nodemailer');
const db = require('../db');

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function send(req, res) {
  const { user_id, channel = 'email', subject, message, to_email } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message es requerido' });
  }

  if (!['email', 'push', 'sms'].includes(channel)) {
    return res.status(400).json({ error: 'Canal inválido. Use: email, push o sms' });
  }

  let status = 'pending';
  let sent_at = null;

  try {
    const notifResult = await db.query(
      `INSERT INTO notifications (user_id, channel, subject, message, status)
       VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
      [user_id || null, channel, subject || null, message]
    );
    const notification = notifResult.rows[0];

    if (channel === 'email' && to_email && process.env.EMAIL_USER) {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: process.env.EMAIL_FROM || `VetCare System <${process.env.EMAIL_USER}>`,
          to: to_email,
          subject: subject || 'Notificación VetCare',
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6c3fc4;">VetCare System</h2>
            <p>${message}</p>
            <hr>
            <small style="color: #888;">Este es un mensaje automático de VetCare System.</small>
          </div>`,
        });
        status = 'sent';
        sent_at = new Date();
      } catch (emailErr) {
        console.error('Error enviando email:', emailErr.message);
        status = 'failed';
      }
    } else if (channel === 'push') {
      status = 'sent';
      sent_at = new Date();
    } else {
      status = 'sent';
      sent_at = new Date();
    }

    const updated = await db.query(
      'UPDATE notifications SET status=$1, sent_at=$2 WHERE id=$3 RETURNING *',
      [status, sent_at, notification.id]
    );

    res.status(201).json({
      notification: updated.rows[0],
      delivery: { channel, status, sent_at },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
}

async function getAll(req, res) {
  try {
    let result;
    if (req.user.role === 'administrador') {
      result = await db.query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100');
    } else {
      result = await db.query(
        'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
}

module.exports = { send, getAll };
