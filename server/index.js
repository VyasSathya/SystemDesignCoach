require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const connectDB = require('./config/db'); // Import connectDB

// Connect to Database
connectDB();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Add basic routes
app.get('/', (req, res) => {
  res.json({ message: 'System Design Coach API Server' });
});

// Register your API routes here
app.use('/api/coaching', require('./routes/coaching'));
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

