const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Add more detailed request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl} - Body:`, req.body);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    port: PORT,
    database_connected: mongoose.connection.readyState === 1
  });
});

// --- Auth routes ---
app.post('/api/auth/login', (req, res) => {
  const data = req.body;
  console.log('Login attempt with:', data);
  res.json({
    token: "dummy_token",
    user: {
      id: 1,
      name: "Test User",
      email: data.email || "test@example.com"
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    user: {
      id: 1,
      name: "Test User",
      email: "test@example.com"
    }
  });
});

// --- Coaching routes ---
app.get('/api/coaching/problems', (req, res) => {
  console.log('Fetching coaching problems');
  res.json({
    problems: [
      { id: 1, title: "Coaching Problem 1", description: "Example coaching problem." },
      { id: 2, title: "Coaching Problem 2", description: "Another example problem." }
    ]
  });
});

app.post('/api/coaching/start/:problemId', (req, res) => {
  const { problemId } = req.params;
  console.log(`Starting coaching session for problem ${problemId}`);
  res.status(201).json({
    session: {
      _id: 123,
      problemId,
      status: "started"
    }
  });
});

// Add this route to handle GET requests for coaching sessions
app.get('/api/coaching/:id', (req, res) => {
  const { id } = req.params;
  console.log(`Fetching coaching session with ID: ${id}`);
  
  // For ID 1 or 123, return a mock coaching session
  if (id === '1' || id === '123') {
    console.log('Returning mock session');
    return res.json({
      session: {
        _id: id,
        problemId: 1,
        status: "in_progress",
        currentStage: "requirements",
        conversation: [
          {
            role: "coach",
            content: "Welcome to your system design coaching session. What would you like to focus on today?",
            timestamp: new Date().toISOString()
          }
        ],
        problem: {
          title: "System Design Practice"
        }
      }
    });
  }
  
  // Return 404 for any other IDs
  console.log(`Session ID ${id} not found`);
  res.status(404).json({ error: "Coaching session not found" });
});

// Add this route to handle POST requests for coaching messages
app.post('/api/coaching/:id/message', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  console.log(`Processing message for session ${id}:`, message);
  
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }
  
  // Return a mock response
  res.json({
    session: {
      _id: id,
      problemId: 1,
      status: "in_progress",
      currentStage: "requirements",
      conversation: [
        {
          role: "coach",
          content: "Welcome to your system design coaching session. What would you like to focus on today?",
          timestamp: new Date(Date.now() - 60000).toISOString()
        },
        {
          role: "student",
          content: message,
          timestamp: new Date(Date.now() - 30000).toISOString()
        },
        {
          role: "coach",
          content: "That's a great topic. Let's break down the requirements and think about the system architecture.",
          timestamp: new Date().toISOString()
        }
      ],
      problem: {
        title: "System Design Practice"
      }
    }
  });
});

// Add routes for materials and diagram
app.post('/api/coaching/:id/materials', (req, res) => {
  const { topic } = req.body;
  console.log(`Fetching materials on topic: ${topic}`);
  
  res.json({
    materials: {
      topic: topic || "System Design",
      content: "Here are some learning materials about " + (topic || "system design") + "..."
    }
  });
});

app.post('/api/coaching/:id/diagram', (req, res) => {
  const { diagramType, customPrompt } = req.body;
  console.log(`Generating diagram type: ${diagramType}, prompt: ${customPrompt}`);
  
  res.json({
    diagram: {
      type: diagramType || "architecture",
      mermaidCode: "graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]",
      description: customPrompt || "System architecture diagram"
    }
  });
});

// List all routes for debugging
app._router.stack.forEach(function(middleware){
  if(middleware.route){
    console.log(`Route: ${Object.keys(middleware.route.methods).join(',')} ${middleware.route.path}`);
  }
});

mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/systemdesigncoach')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Routes available at http://localhost:${PORT}/api/coaching/1`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Don't exit process, start server anyway
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without MongoDB)`);
      console.log(`Routes available at http://localhost:${PORT}/api/coaching/1`);
    });
  });