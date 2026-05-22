require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const storageRoutes = require('./routes/storage.routes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'storage-service' }));

app.use('/api/v1/storage', storageRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
