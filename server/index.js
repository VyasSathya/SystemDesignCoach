require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const coachingRoutes = require('./routes/coaching');
const interviewRoutes = require('./routes/interviews');
const problemRoutes = require('./routes/problems');
const graderRoutes = require('./routes/grader');
const workbookRoutes = require('./routes/workbook');
const diagramRoutes = require('./routes/diagrams');
const sessionRoutes = require('./routes/sessions');

const app = express();

// Enhanced security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/grader', graderRoutes);
app.use('/api/workbook', workbookRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal server error',
      status: err.status || 500
    }
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

startServer();

module.exports = app; // For testing purposes
