// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - Body:`, req.body);
  next();
});
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    port: PORT,
    database_connected: mongoose.connection.readyState === 1
  });
});

const sessions = {};

let authRoutes, coachingRoutes, interviewRoutes, problemRoutes, usersRoutes;
try { authRoutes = require('./routes/auth'); console.log("Auth routes loaded successfully"); } catch (err) { console.log("Auth routes not available"); }
try { coachingRoutes = require('./routes/coaching'); console.log("Coaching routes loaded successfully"); } catch (err) { console.log("Coaching routes not available"); }
try { interviewRoutes = require('./routes/interviews'); console.log("Interview routes loaded successfully"); } catch (err) { console.log("Interview routes not available"); }
try { problemRoutes = require('./routes/problems'); console.log("Problem routes loaded successfully"); } catch (err) { console.log("Problem routes not available"); }
try { usersRoutes = require('./routes/users'); console.log("User routes loaded successfully"); } catch (err) { console.log("User routes not available"); }

app.use('/api/auth', authRoutes || ((req, res, next) => next()));
app.use('/api/coaching', coachingRoutes || ((req, res, next) => next()));
app.use('/api/interviews', interviewRoutes || ((req, res) => res.json({ message: "Mock interview response" })));
app.use('/api/problems', problemRoutes || ((req, res) => {
  res.json([
    { id: 1, title: "Design a URL Shortener", difficulty: "medium" },
    { id: 2, title: "Design Twitter", difficulty: "hard" }
  ]);
}));
app.use('/api/users', usersRoutes || ((req, res) => res.json({ id: 1, name: "Test User", email: "test@example.com" })));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
