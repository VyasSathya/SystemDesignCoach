const express = require('express');
const coachingRoutes = require('./routes/coaching');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Register the coaching routes
app.use('/api/coaching', coachingRoutes);

// Other routes and middleware...