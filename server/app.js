const express = require('express');
const cors = require('cors');
const aiRoutes = require('./routes/ai');
const logger = require('./utils/logger');

const app = express();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body
  });
  next();
});

app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
