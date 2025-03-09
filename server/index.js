// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Import routes
// Try to import routes, but provide fallbacks if they're not available
let authRoutes, coachingRoutes, interviewRoutes, problemRoutes, usersRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log("Auth routes loaded successfully");
} catch (err) {
  console.log("Auth routes not available, using fallback");
}

try {
  coachingRoutes = require('./routes/coaching');
  console.log("Coaching routes loaded successfully");
} catch (err) {
  console.log("Coaching routes not available, using fallback");
}

try {
  interviewRoutes = require('./routes/interviews');
  console.log("Interview routes loaded successfully");
} catch (err) {
  console.log("Interview routes not available, using fallback");
}

try {
  problemRoutes = require('./routes/problems');
  console.log("Problem routes loaded successfully");
} catch (err) {
  console.log("Problem routes not available, using fallback");
}

try {
  usersRoutes = require('./routes/users');
  console.log("User routes loaded successfully");
} catch (err) {
  console.log("User routes not available, using fallback");
}

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Add more detailed request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.originalUrl} - Body:`, req.body);
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

// Store sessions in memory for development
const sessions = {};

// Use routes with fallbacks
app.use('/api/auth', authRoutes || ((req, res, next) => {
  // Fallback auth routes if auth.js is not available
  if (req.path === '/login') {
    return res.json({
      token: "dummy_token",
      user: {
        id: 1,
        name: "Test User",
        email: req.body.email || "test@example.com"
      }
    });
  }
  if (req.path === '/me') {
    return res.json({
      user: {
        id: 1,
        name: "Test User",
        email: "test@example.com"
      }
    });
  }
  next();
}));

// If we have the dedicated coaching routes, use them
// Otherwise, use the inline routes defined below
if (coachingRoutes) {
  app.use('/api/coaching', coachingRoutes);
} else {
  // Coaching Routes (Inline fallback)
  // Get all coaching problems
  app.get('/api/coaching/problems', (req, res) => {
    console.log('Fetching coaching problems');
    res.json([
      { id: 1, title: "Design a URL Shortener like TinyURL", difficulty: "medium" },
      { id: 2, title: "Design Twitter", difficulty: "hard" },
      { id: 3, title: "Design a Chat Application", difficulty: "medium" },
      { id: 4, title: "Design a File Storage Service like Dropbox", difficulty: "hard" },
      { id: 5, title: "Design a Parking Lot System", difficulty: "easy" }
    ]);
  });

  // Start a new coaching session
  app.post('/api/coaching/start/:problemId', (req, res) => {
    const { problemId } = req.params;
    console.log(`Starting coaching session for problem ${problemId}`);
    
    // Generate a session ID
    const sessionId = problemId;
    
    // Get problem details
    const problemTitle = getProblemTitle(problemId);
    const welcomeMessage = getWelcomeMessage(problemId);
    
    // Create a new session
    const newSession = {
      id: sessionId,
      problem: { 
        id: problemId, 
        title: problemTitle
      },
      conversation: [{
        role: "assistant",
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }],
      diagram: {
        mermaidCode: getStarterDiagram(problemId)
      },
      createdAt: new Date().toISOString()
    };
    
    sessions[sessionId] = newSession;
    
    // Return just the ID for redirection
    return res.status(201).json({ id: sessionId });
  });

  // Get a specific coaching session
  app.get('/api/coaching/:id', (req, res) => {
    const { id } = req.params;
    console.log(`GET request for coaching session ${id}`);
    
    // Check if session exists
    if (sessions[id]) {
      return res.json(sessions[id]);
    } else {
      // For ID 1-5, create a problem-specific mock session if it doesn't exist yet
      if (id >= 1 && id <= 5) {
        const problemId = id;
        const mockSession = {
          id: id,
          problem: { 
            id: problemId, 
            title: getProblemTitle(problemId) 
          },
          conversation: [{
            role: "assistant",
            content: getWelcomeMessage(problemId),
            timestamp: new Date().toISOString()
          }],
          diagram: {
            mermaidCode: getStarterDiagram(problemId)
          },
          createdAt: new Date().toISOString()
        };
        
        sessions[id] = mockSession;
        return res.json(mockSession);
      }
      
      // Create a generic session for any other ID
      const defaultSession = {
        id,
        conversation: [{
          role: "assistant",
          content: "Welcome to your system design coaching session. What would you like to focus on today?",
          timestamp: new Date().toISOString()
        }],
        diagram: {
          mermaidCode: 'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]'
        },
        problem: { title: 'System Design Coaching' },
        createdAt: new Date().toISOString()
      };
      
      sessions[id] = defaultSession;
      return res.json(defaultSession);
    }
  });

  // Send a message in a coaching session
  app.post('/api/coaching/:id/message', (req, res) => {
    const { id } = req.params;
    const { message, contextInfo } = req.body;
    
    console.log(`Message received for session ${id}:`, message);
    console.log('Context info:', contextInfo ? 'Present' : 'None');
    
    // Make sure session exists
    if (!sessions[id]) {
      sessions[id] = {
        id,
        conversation: [{
          role: "assistant",
          content: "Welcome to your system design coaching session. What would you like to focus on today?",
          timestamp: new Date().toISOString()
        }],
        diagram: {
          mermaidCode: 'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]'
        },
        problem: { title: 'System Design Coaching' },
        createdAt: new Date().toISOString()
      };
    }
    
    // Add user message to conversation
    sessions[id].conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Generate a mock response
    let response;
    if (message.toLowerCase().includes('diagram')) {
      response = "I've reviewed your diagram. The structure looks good! Consider adding more details about how the components interact, especially around scalability.";
    } else if (message.toLowerCase().includes('database')) {
      response = "When choosing a database, consider your access patterns. NoSQL databases like MongoDB are great for flexible schemas and horizontal scaling, while relational databases like PostgreSQL offer strong consistency and complex querying capabilities.";
    } else if (message.toLowerCase().includes('scale') || message.toLowerCase().includes('scaling')) {
      response = "For scaling this system, you'd want to consider both vertical scaling (upgrading hardware) and horizontal scaling (adding more instances). Load balancers will be essential when scaling horizontally.";
    } else {
      response = "That's an interesting approach. Let's develop this further. Have you considered how this would handle increased load as the system grows?";
    }
    
    // Add bot response to conversation
    sessions[id].conversation.push({
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString()
    });
    
    // Save diagram if provided in contextInfo
    if (contextInfo?.diagramContext?.mermaidCode) {
      sessions[id].diagram = {
        mermaidCode: contextInfo.diagramContext.mermaidCode
      };
    }
    
    // Return response
    return res.json({ message: response });
  });

  // Get learning materials
  app.post('/api/coaching/:id/materials', (req, res) => {
    const { topic } = req.body;
    
    const materials = {
      title: `Learning Materials: ${topic ? (topic.charAt(0).toUpperCase() + topic.slice(1)) : 'System Design'}`,
      content: `
        <h2>Key Concepts in ${topic ? (topic.charAt(0).toUpperCase() + topic.slice(1)) : 'System Design'}</h2>
        <p>This is a mock learning material. In a real implementation, this would contain educational content.</p>
        <ul>
          <li><strong>Scalability</strong>: The ability of a system to handle growing amounts of work by adding resources.</li>
          <li><strong>Availability</strong>: The proportion of time a system is in a functioning condition.</li>
          <li><strong>Reliability</strong>: The ability of a system to perform its required functions under stated conditions for a specified period of time.</li>
          <li><strong>Performance</strong>: A measure of the amount of useful work accomplished by the system relative to the time and resources used.</li>
        </ul>
        <p>Consider carefully how your design addresses these concerns.</p>
      `
    };
    
    return res.json(materials);
  });

  // Get AI diagram suggestion
  app.post('/api/coaching/:id/diagram', (req, res) => {
    const { diagramType, customPrompt } = req.body;
    const { id } = req.params;
    
    // Get problem-specific diagram if available
    let mermaidCode = '';
    if (sessions[id]?.problem?.id) {
      const problemId = sessions[id].problem.id;
      mermaidCode = getAISuggestedDiagram(problemId, diagramType);
    } else {
      // Return a generic diagram
      mermaidCode = `graph TD
      User[User] --> Frontend[Frontend]
      Frontend --> API[API Gateway]
      API --> Auth[Authentication Service]
      API --> Service[Core Service]
      Service --> DB[(Database)]
      Service --> Cache[(Redis Cache)]
      Service --> Queue[(Message Queue)]
      Queue --> Worker[Background Worker]
      Worker --> DB`;
    }
    
    return res.json({ mermaidCode });
  });

  // Save diagram
  app.post('/api/coaching/:id/diagram/save', (req, res) => {
    const { id } = req.params;
    const { diagram } = req.body;
    
    // Make sure session exists
    if (!sessions[id]) {
      sessions[id] = {
        id,
        conversation: [{
          role: "assistant",
          content: "Welcome to your system design coaching session. What would you like to focus on today?",
          timestamp: new Date().toISOString()
        }],
        diagram: {
          mermaidCode: 'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]'
        },
        problem: { title: 'System Design Coaching' },
        createdAt: new Date().toISOString()
      };
    }
    
    // Save the diagram
    if (diagram) {
      sessions[id].diagram = diagram;
    }
    
    return res.json({ success: true });
  });

  // Get all coaching sessions (for listing)
  app.get('/api/coaching', (req, res) => {
    // Convert sessions object to array
    const sessionList = Object.values(sessions);
    return res.json(sessionList);
  });
}

app.use('/api/interviews', interviewRoutes || ((req, res) => {
  // Fallback for interviews routes
  res.json({ message: "Mock interview response" });
}));

app.use('/api/problems', problemRoutes || ((req, res) => {
  // Fallback for problems routes
  res.json([
    { id: 1, title: "Design a URL Shortener", difficulty: "medium" },
    { id: 2, title: "Design Twitter", difficulty: "hard" }
  ]);
}));

app.use('/api/users', usersRoutes || ((req, res) => {
  // Fallback for users routes
  res.json({ id: 1, name: "Test User", email: "test@example.com" });
}));

// Serve static files if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Helper Functions
// Helper function to get problem title by ID
function getProblemTitle(problemId) {
  const problems = {
    1: "Design a URL Shortener like TinyURL",
    2: "Design Twitter",
    3: "Design a Chat Application",
    4: "Design a File Storage Service like Dropbox",
    5: "Design a Parking Lot System"
  };
  
  return problems[problemId] || "System Design Problem";
}

// Helper function to get welcome message based on problem ID
function getWelcomeMessage(problemId) {
  const welcomeMessages = {
    1: "Welcome to your URL Shortener design session! I'll help you design a service like TinyURL. Let's start by discussing the requirements. What features do you think are essential for a URL shortening service?",
    
    2: "Welcome to your Twitter design session! Designing a service like Twitter involves multiple components including news feed, posting tweets, following users, and more. Where would you like to start?",
    
    3: "Welcome to your Chat Application design session! We'll design a real-time messaging application. Would you like to start by discussing the messaging protocol, storage, or the overall architecture?",
    
    4: "Welcome to your File Storage Service design session! Services like Dropbox handle large file uploads, synchronization, and sharing. What aspects would you like to focus on first?",
    
    5: "Welcome to your Parking Lot System design session! This is a classic design problem that tests your object-oriented design skills. Would you like to start by discussing the classes/objects or the overall system requirements?"
  };
  
  return welcomeMessages[problemId] || "Welcome to your system design coaching session. What would you like to focus on today?";
}

// Helper function to get starter diagram based on problem ID
function getStarterDiagram(problemId) {
  const starterDiagrams = {
    1: `graph TD
    User[User] --> Frontend[Frontend]
    Frontend --> API[API Gateway]
    API --> URLService[URL Service]
    URLService --> DB[(Database)]`,
    
    2: `graph TD
    User[User] --> LoadBalancer{Load Balancer}
    LoadBalancer --> WebServer[Web Server]
    WebServer --> TweetService[Tweet Service]
    WebServer --> UserService[User Service]
    WebServer --> TimelineService[Timeline Service]
    TweetService --> TweetDB[(Tweet DB)]
    UserService --> UserDB[(User DB)]
    TimelineService --> Cache((Redis Cache))
    TimelineService --> TweetDB`,
    
    3: `graph TD
    Client[Client] --> WebSocket[WebSocket Server]
    WebSocket --> MessageService[Message Service]
    MessageService --> DB[(Message DB)]
    MessageService --> Cache((Redis Cache))
    MessageService --> PushNotification[Push Notification Service]`,
    
    4: `graph TD
    Client[Client] --> LoadBalancer{Load Balancer}
    LoadBalancer --> APIGateway[API Gateway]
    APIGateway --> AuthService[Auth Service]
    APIGateway --> FileService[File Service]
    APIGateway --> SharingService[Sharing Service]
    FileService --> MetadataDB[(Metadata DB)]
    FileService --> ObjectStorage[(Object Storage)]
    FileService --> SyncQueue([Sync Queue])
    SyncQueue --> SyncWorker[Sync Worker]`,
    
    5: `graph TD
    Entry[Entry Terminal] --> ParkingSystem[Parking System]
    Exit[Exit Terminal] --> ParkingSystem
    ParkingSystem --> ParkingSpot[Parking Spot Manager]
    ParkingSystem --> PaymentProcessor[Payment Processor]
    ParkingSystem --> DB[(Database)]`
  };
  
  return starterDiagrams[problemId] || 'graph TD\n    Client[Client] --> API[API Gateway]\n    API --> Service[Service]\n    Service --> DB[(Database)]';
}

// Helper function to get AI-suggested diagram based on problem and type
function getAISuggestedDiagram(problemId, diagramType) {
  // For simplicity, just return an enhanced version of the starter diagram
  const starterDiagram = getStarterDiagram(problemId);
  
  // Add more details based on the problem
  if (problemId == 1) {
    return `graph TD
    User[User] --> Frontend[Frontend UI]
    Frontend --> APIGateway[API Gateway]
    APIGateway --> AuthService[Auth Service]
    APIGateway --> URLService[URL Shortening Service]
    URLService --> Cache((Redis Cache))
    URLService --> DB[(URL Database)]
    URLService --> Analytics[Analytics Service]
    Analytics --> ClickDB[(Click Analytics DB)]
    Cache --> DB
    DB --> ReplicationDB[(Replica DB)]`;
  }
  
  if (problemId == 2) {
    return `graph TD
    User[User] --> CDN[CDN]
    CDN --> LoadBalancer{Load Balancer}
    LoadBalancer --> WebServer[Web Server]
    WebServer --> TweetService[Tweet Service]
    WebServer --> UserService[User Service]
    WebServer --> TimelineService[Timeline Service]
    WebServer --> NotificationService[Notification Service]
    WebServer --> SearchService[Search Service]
    TweetService --> TweetDB[(Tweet DB)]
    TweetService --> TweetCache((Tweet Cache))
    UserService --> UserDB[(User DB)]
    UserService --> UserCache((User Cache))
    TimelineService --> TimelineCache((Timeline Cache))
    TimelineService --> TweetDB
    TimelineService --> TweetQueue([Tweet Processing Queue])
    TweetQueue --> RecommendationWorker[Recommendation Worker]
    SearchService --> SearchIndex[(Search Index)]
    NotificationService --> PushQueue([Push Notification Queue])
    PushQueue --> PushWorker[Push Worker]`;
  }
  
  if (problemId == 3) {
    return `graph TD
    Client[Client] --> LoadBalancer{Load Balancer}
    LoadBalancer --> WebServer[Web Server]
    WebServer --> WebSocketManager[WebSocket Manager]
    WebSocketManager --> ConnectionStore((Connection Store))
    WebSocketManager --> MessageRouter[Message Router]
    MessageRouter --> ChatService[Chat Service]
    ChatService --> MessageDB[(Message DB)]
    ChatService --> MessageCache((Message Cache))
    ChatService --> UserPresence[User Presence Service]
    UserPresence --> PresenceCache((Presence Cache))
    ChatService --> NotificationService[Notification Service]
    NotificationService --> PushQueue([Push Queue])
    PushQueue --> PushWorker[Push Worker]
    ChatService --> FileService[File Service]
    FileService --> FileStorage[(File Storage)]`;
  }
  
  // Return the starter diagram with minor enhancements for other problems
  return starterDiagram + '\n    Service --> Cache((Cache))\n    Service --> Queue([Message Queue])\n    Queue --> Worker[Background Worker]\n    Worker --> DB';
}

// Connect to MongoDB
try {
  console.log("Attempting to connect to MongoDB...");
  if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        console.log("MongoDB connected successfully");
      })
      .catch(err => {
        console.error("MongoDB connection error:", err.message);
        console.log("Server will continue without database connection");
      });
  } else {
    console.log("No MongoDB URI provided, skipping database connection");
  }
} catch (err) {
  console.error("Error in MongoDB connection setup:", err);
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;