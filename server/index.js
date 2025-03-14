require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const coachingRoutes = require('./routes/coaching');
const interviewRoutes = require('./routes/interviews');
const problemRoutes = require('./routes/problems');
const graderRoutes = require('./routes/grader');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/grader', graderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Test the API at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app; // For testing purposes
