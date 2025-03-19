const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Register workbook routes
app.use('/api/workbook', require('./routes/api/workbook'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`CORS enabled for origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
});

