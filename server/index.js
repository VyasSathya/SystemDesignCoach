require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const coachingRoutes = require('./routes/coaching');
const authRoutes = require('./routes/auth');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection string
const mongoUri = process.env.MONGO_URI || "mongodb+srv://vyassathya:SanD%21eg0@system-design-db.24esv.mongodb.net/systemdesigncoach";

// MongoDB connection
mongoose.connect(mongoUri)
  .then(() => logger.info('Connected to MongoDB Atlas'))
  .catch(err => logger.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);  // Make sure this line exists
app.use('/api/coaching', coachingRoutes);

// Add a test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Available routes:');
  logger.info('POST /api/auth/register');
  logger.info('POST /api/auth/login');
});
