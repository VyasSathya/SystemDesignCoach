const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/workbook', require('./routes/workbook'));
app.use('/api/coaching', require('./routes/api/coaching'));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ success: false, error: 'Server error' });
});

module.exports = app;
