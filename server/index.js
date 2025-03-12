// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------
// Initialize PersonaService
// ------------------------------
const coachPersona = require('../data/persona/coachPersona');
const interviewerPersona = require('../data/persona/interviewerPersona');
const graderPersona = require('../data/persona/graderPersona');

const personaConfig = {
  personas: [coachPersona, interviewerPersona, graderPersona]
};

const PersonaService = require('./services/engines/PersonaService');
PersonaService.initialize(personaConfig);
console.log("Initialized personas:", PersonaService.getAllPersonas().map(p => p.id).join(", "));

// ------------------------------
// Middleware Setup
// ------------------------------
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    port: PORT,
    database_connected: mongoose.connection.readyState === 1
  });
});

// ------------------------------
// Load Routes
// ------------------------------
const authRoutes = require('./routes/auth') || ((req, res, next) => next());
const coachingRoutes = require('./routes/coaching') || ((req, res, next) => next());
const interviewRoutes = require('./routes/interviews') || ((req, res) => res.json({ message: "Mock interview response" }));
const problemRoutes = require('./routes/problems') || ((req, res) => {
  res.json([
    { id: 1, title: "Design a URL Shortener", difficulty: "medium" },
    { id: 2, title: "Design Twitter", difficulty: "hard" }
  ]);
});
const usersRoutes = require('./routes/users') || ((req, res) => res.json({ id: 1, name: "Test User", email: "test@example.com" }));

app.use('/api/auth', authRoutes);
app.use('/api/coaching', coachingRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/users', usersRoutes);

// ------------------------------
// Serve Client in Production
// ------------------------------
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// ------------------------------
// MongoDB Connection
// ------------------------------
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch(err => {
      console.error("MongoDB connection error:", err.message);
      console.log("Server will continue without database connection");
    });
} else {
  console.log("No MongoDB URI provided, skipping database connection");
}

// ------------------------------
// Start Server
// ------------------------------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
