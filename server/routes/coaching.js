// server/routes/coaching.js
const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const Interview = require('../models/Interview');
const ClaudeService = require('../services/ai/claudeService');
const coachEngine = require('../services/engines/coachEngine');
const PersonaService = require('../services/engines/PersonaService');
const diagramService = require('../services/diagram/diagramService');

// In-memory session store for development/fallback
const sessions = {};

// Get all coaching problems
router.get('/problems', async (req, res) => {
  console.log('GET request for coaching problems');
  try {
    const problems = await Problem.find({ $or: [{ type: 'coaching' }, { type: 'both' }] });
    if (problems && problems.length > 0) {
      const formatted = problems.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        description: p.description,
        estimatedTime: p.estimatedTime
      }));
      return res.json(formatted);
    }
    console.log('No problems found in DB, falling back to markdown/JSON...');
    const fallbackRoute = require('./problems');
    fallbackRoute(req, res);
  } catch (error) {
    console.error('Error fetching coaching problems:', error);
    res.status(500).json({ error: 'Failed to fetch coaching problems' });
  }
});

// Start a new coaching session
router.post('/start/:problemId', async (req, res) => {
  const { problemId } = req.params;
  const { userId } = req.body || {};
  try {
    // Try to use coachEngine to start the session
    let session = null;
    try {
      if (coachEngine && userId) {
        session = await coachEngine.startSession(userId, problemId);
      }
    } catch (engineError) {
      console.warn('Error starting session with coachEngine:', engineError);
    }
    
    // Fallback to manual session creation if engine fails
    if (!session) {
      const problem = await Problem.findOne({ id: problemId }) || {};
      const welcomeMessage = (problem.promptSequence && problem.promptSequence[0])
        ? problem.promptSequence[0].question
        : `Welcome to your ${problem.title || 'System Design'} session! Let's get started.`;
      
      session = {
        id: problemId,
        problem: {
          id: problemId,
          title: problem.title || 'System Design Problem',
          description: problem.description || ''
        },
        conversation: [{
          role: 'assistant',
          content: welcomeMessage,
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
      };
      
      // Store session in memory
      sessions[problemId] = session;
      
      // If we have a userId, try to store in database
      if (userId) {
        try {
          const dbSession = new Interview({
            userId,
            problemId,
            status: 'in_progress',
            currentStage: 'introduction',
            type: 'coaching',
            conversation: [{
              role: 'coach',
              content: welcomeMessage,
              timestamp: new Date().toISOString()
            }]
          });
          await dbSession.save();
          session = dbSession;
        } catch (dbError) {
          console.warn('Error saving session to database:', dbError);
        }
      }
    }
    
    return res.status(201).json(session);
  } catch (error) {
    console.error('Error starting coaching session:', error);
    res.status(500).json({ error: 'Failed to start coaching session' });
  }
});

// Get session by ID
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  console.log(`GET request for coaching session ${sessionId}`);
  try {
    // Look up the session in your database or in-memory
    let session = null;
    
    // Try different ways to find the session
    try {
      // First, try to find it by MongoDB ID
      if (sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        session = await Interview.findById(sessionId);
      }
      
      // If not found, try by 'id' field
      if (!session) {
        session = await Interview.findOne({ id: sessionId });
      }
      
      // If still not found, check in-memory sessions
      if (!session && sessions[sessionId]) {
        session = sessions[sessionId];
      }
    } catch (findError) {
      console.warn("Error finding session:", findError);
    }
    
    // Create a default session if nothing found
    if (!session) {
      console.log(`Creating new default session for ID ${sessionId}`);
      // Create a new in-memory session
      session = {
        id: sessionId,
        problem: {
          id: 'default-problem',
          title: 'System Design Problem'
        },
        conversation: [{
          role: 'assistant',
          content: "Welcome to your system design coaching session! I'm here to help you design effective systems. What would you like to discuss today?",
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString()
      };
      
      // Store it for future requests
      sessions[sessionId] = session;
    }
    
    console.log(`Returning session for ${sessionId}`);
    res.json(session);
  } catch (error) {
    console.error('Error in GET /:sessionId route:', error);
    res.status(500).json({ 
      error: 'Failed to get coaching session',
      message: error.message
    });
  }
});

// Send message in session
router.post('/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, contextInfo } = req.body;
    
    console.log(`Message received for session ${sessionId}:`, message);
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        error: 'Message is required',
        message: {
          role: 'coach',
          content: "I couldn't understand your message. Please try again.",
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Get session from database or memory
    let session = null;
    try {
      if (sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        session = await Interview.findById(sessionId);
      }
      if (!session) {
        session = await Interview.findOne({ id: sessionId });
      }
    } catch (findError) {
      console.warn("Error finding session in database:", findError);
    }
    
    // Use in-memory session if not found in database
    if (!session) {
      session = sessions[sessionId];
    }
    
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        message: {
          role: 'coach',
          content: "Session not found. Start a new session.",
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Check if we can use the coach engine
    let response = null;
    try {
      // Add user message to conversation
      if (!session.conversation) {
        session.conversation = [];
      }
      
      session.conversation.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });
      
      if (coachEngine) {
        // Extract context information
        const currentPage = contextInfo?.currentPage;
        const currentSection = contextInfo?.currentSection;
        const workbookContent = contextInfo?.workbookContent;
        const userLevel = contextInfo?.userLevel;
        const conciseMode = contextInfo?.conciseMode;
        
        // Process with coach engine
        response = await coachEngine.processMessage(sessionId, message, {
          currentPage,
          currentSection,
          workbookContent,
          userLevel,
          conciseMode
        });
      }
    } catch (engineError) {
      console.error("Error using coachEngine:", engineError);
    }
    
    // If coachEngine fails, use Claude directly
    if (!response) {
      try {
        // Create a fresh Claude instance with unique timestamp
        const uniqueClaude = new ClaudeService({ timestamp: Date.now(), maxRetries: 5 });
        const recentMessages = [{ role: 'user', content: message }];
        
        // Build system prompt from PersonaService if available
        let systemPrompt = "You are a helpful System Design Coach.";
        try {
          const contextData = {
            currentPage: contextInfo?.currentPage,
            designData: { 
              workbookContent: contextInfo?.workbookContent, 
              currentSection: contextInfo?.currentSection 
            }
          };
          
          systemPrompt = PersonaService.getSystemPrompt(contextData);
        } catch (personaError) {
          console.warn('Error getting persona system prompt:', personaError);
        }
        
        console.log("System Prompt (first 50 chars):", systemPrompt.substring(0, 50) + '...');
        const aiResponse = await uniqueClaude.sendMessage(recentMessages, {
          system: systemPrompt,
          systemPrompt: systemPrompt,
          temperature: 0.8,
          conciseMode: contextInfo?.conciseMode
        });
        
        console.log('Claude response received:', aiResponse ? aiResponse.substring(0, 50) + '...' : 'No response');
        response = {
          role: 'coach',
          content: aiResponse,
          timestamp: new Date().toISOString()
        };
      } catch (claudeError) {
        console.error("Error using Claude directly:", claudeError);
        response = {
          role: 'coach',
          content: "I'm having difficulty processing your request right now. Could you try again with a different question?",
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Add response to session
    session.conversation.push(response);
    
    // Save to database if it's a database session
    if (session.save) {
      try {
        await session.save();
      } catch (saveError) {
        console.warn("Error saving session to database:", saveError);
      }
    } else {
      // Update in-memory session
      sessions[sessionId] = session;
    }
    
    // Send response
    res.json({ message: response, diagramSuggestions: null });
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: {
        role: 'coach',
        content: "There was an error processing your message. Please try again.",
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Generate learning materials
router.post('/:sessionId/materials', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { topic, userLevel, conciseMode } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    try {
      // Try to use coach engine
      if (coachEngine) {
        const materials = await coachEngine.generateContent(sessionId, topic, {
          userLevel,
          conciseMode
        });
        
        return res.json(materials);
      }
      
      // Fallback if coach engine fails
      return res.json({
        title: `Learning Materials: ${topic}`,
        content: `This is placeholder content for learning materials on "${topic}". In production, this would be generated based on your specific session and requirements.`
      });
    } catch (error) {
      console.error('Error generating materials:', error);
      res.json({
        title: `Learning Materials: ${topic}`,
        content: 'Unable to generate materials at this time. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Error processing materials request:', error);
    res.status(500).json({ error: 'Failed to process materials request' });
  }
});

// Generate diagram
router.post('/:sessionId/diagram', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { diagramType = 'architecture', customPrompt = null } = req.body;
    
    let diagram = null;
    
    // Try to use coach engine or diagram service
    try {
      if (coachEngine && coachEngine.generateDiagram) {
        diagram = await coachEngine.generateDiagram(sessionId, diagramType, { customPrompt });
      } else if (diagramService) {
        diagram = await diagramService.generateDiagram(sessionId, diagramType, customPrompt);
      }
    } catch (engineError) {
      console.warn("Error generating diagram with service:", engineError);
    }
    
    // Fallback to default diagram
    if (!diagram) {
      let defaultMermaid = '';
      
      if (diagramType === 'sequence') {
        defaultMermaid = 'sequenceDiagram\n  Client->>API: Request\n  API->>Service: Process\n  Service->>Database: Query\n  Database-->>Service: Result\n  Service-->>API: Response\n  API-->>Client: Result';
      } else if (diagramType === 'er') {
        defaultMermaid = 'erDiagram\n  USER ||--o{ ORDER : places\n  ORDER ||--|{ LINE_ITEM : contains';
      } else {
        defaultMermaid = 'graph TD\n  Client[Client] --> API[API Gateway]\n  API --> Service[Service]\n  Service --> DB[(Database)]';
      }
      
      diagram = {
        type: diagramType,
        mermaidCode: defaultMermaid,
        description: `Default ${diagramType} diagram`
      };
    }
    
    res.json(diagram);
  } catch (error) {
    console.error('Error generating diagram:', error);
    res.status(500).json({ error: 'Failed to generate diagram' });
  }
});

// Save diagram
router.post('/:sessionId/diagram/save', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { diagram } = req.body;
    
    if (!diagram) {
      return res.status(400).json({ error: 'Diagram data is required' });
    }
    
    // Try to find the session
    let session = null;
    
    try {
      if (sessionId.match(/^[0-9a-fA-F]{24}$/)) {
        session = await Interview.findById(sessionId);
      }
      if (!session) {
        session = await Interview.findOne({ id: sessionId });
      }
    } catch (findError) {
      console.warn("Error finding session in database:", findError);
    }
    
    // Use in-memory session if not found in database
    if (!session) {
      session = sessions[sessionId];
    }
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Update diagram in session
    if (!session.diagrams) {
      session.diagrams = [];
    }
    
    // Check if a diagram of this type already exists
    const existingIndex = session.diagrams.findIndex(d => d.type === diagram.type);
    
    if (existingIndex >= 0) {
      // Update existing diagram
      session.diagrams[existingIndex] = {
        ...session.diagrams[existingIndex],
        mermaidCode: diagram.mermaidCode,
        reactFlowData: diagram.reactFlowData,
        updatedAt: new Date()
      };
    } else {
      // Add new diagram
      session.diagrams.push({
        type: diagram.type || 'architecture',
        mermaidCode: diagram.mermaidCode,
        reactFlowData: diagram.reactFlowData,
        name: diagram.name || 'System Design',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Save to database if it's a database session
    if (session.save) {
      await session.save();
    } else {
      // Update in-memory session
      sessions[sessionId] = session;
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving diagram:', error);
    res.status(500).json({ error: 'Failed to save diagram' });
  }
});

module.exports = router;