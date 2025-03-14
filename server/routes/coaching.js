const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const logger = require('../utils/logger');

// Get coaching problems
router.get('/problems', async (req, res) => {
  try {
    // Find all problems that are either type 'coaching' or 'both'
    const problems = await Problem.find({
      $or: [
        { type: 'coaching' },
        { type: 'both' }
      ]
    });

    // If no problems found in DB, return default problems
    if (!problems || problems.length === 0) {
      const defaultProblems = [
        {
          id: "distributed-cache",
          title: "Design a Distributed Cache",
          difficulty: "intermediate",
          description: "Design a distributed caching system that can scale to handle high traffic and provide fast access to frequently used data.",
          estimatedTime: 45,
          type: "coaching"
        },
        {
          id: "url-shortener",
          title: "Design a URL Shortener",
          difficulty: "intermediate",
          description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
          estimatedTime: 40,
          type: "coaching"
        },
        {
          id: "chat-system",
          title: "Design a Real-time Chat System",
          difficulty: "advanced",
          description: "Design a scalable real-time chat system that supports both one-on-one and group messaging.",
          estimatedTime: 50,
          type: "coaching"
        }
      ];

      logger.info('Returning default problems as no problems found in DB');
      return res.json({ problems: defaultProblems });
    }

    logger.info(`Found ${problems.length} problems`);
    return res.json({ problems });

  } catch (error) {
    logger.error('Error fetching coaching problems:', error);
    res.status(500).json({ 
      error: 'Failed to fetch coaching problems',
      details: error.message 
    });
  }
});

// Start new coaching session
router.post('/start/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Find the problem in the database
    const problem = await Problem.findOne({ id: problemId });
    
    // If problem not found, use default configuration
    const problemConfig = problem || {
      id: problemId,
      title: 'System Design Problem',
      description: 'Design a scalable system architecture.'
    };
    
    const session = {
      id: Date.now().toString(), // Generate a unique session ID
      problem: {
        id: problemConfig.id,
        title: problemConfig.title,
        description: problemConfig.description
      },
      conversation: [{
        role: 'assistant',
        content: `Welcome to the ${problemConfig.title} design challenge! We'll work together to create a robust system design. Let's start by discussing the core requirements. What do you think are the essential features this system should have?`,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };

    logger.info('Session created:', {
      id: session.id,
      problemTitle: session.problem.title,
      timestamp: session.createdAt
    });
    
    return res.status(201).json(session);
  } catch (error) {
    logger.error('Error starting session:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Get session by ID
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  logger.info(`GET session request`, { sessionId });
  
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
    
    logger.info(`Session retrieved successfully`, { 
      sessionId,
      hasConversation: !!session?.conversation?.length
    });
    res.json(session);
  } catch (error) {
    logger.error(`Error fetching session`, { 
      sessionId, 
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to get coaching session' });
  }
});

// Handle messages
router.post('/:sessionId/message', async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;
  const userId = req.user?.id; // Assuming you have auth middleware

  logger.info('Message received', { sessionId, messageLength: message?.length });

  try {
    // Find or create session
    let session = await Session.findOne({ _id: sessionId });
    if (!session) {
      session = new Session({
        userId,
        problemId: req.body.problemId || 'default',
        messages: []
      });
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
      metadata: { stage: req.body.stage || 0 }
    });

    // Save session
    await session.save();

    // Process message and get AI response
    const systemPrompt = await buildSystemPrompt(session);
    const contextInfo = {
      problemId: session.problem.id,
      workbookContent: req.body.workbookContent || {},
      currentSection: req.body.currentSection || ''
    };

    logger.coaching(sessionId, 'Processing message', {
      systemPromptLength: systemPrompt.length
    });

    const response = await processMessage(message, systemPrompt, contextInfo);

    // Add AI response to session
    session.messages.push({
      role: 'assistant',
      content: response.content,
      timestamp: new Date(),
      metadata: { stage: req.body.stage || 0 }
    });

    // Save session again with AI response
    await session.save();

    logger.info('Message processed successfully', { sessionId });
    res.json({ message: response });

  } catch (error) {
    logger.error('Message processing failed', {
      sessionId,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to process message' });
  }
});

function isGreeting(message) {
  const greetings = ['hello', 'hi', 'hey', 'greetings'];
  return greetings.some(g => message.toLowerCase().includes(g));
}

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
router.post('/api/coaching/:sessionId/diagram/save', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { diagram } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    const diagramData = {
      userId,
      sessionId,
      mermaidCode: diagram.mermaidCode,
      reactFlowData: diagram.reactFlowData,
      type: diagram.type || 'flowchart',
      name: diagram.name || 'System Design',
      version: diagram.version || 1
    };

    // Upsert the diagram
    await Diagram.findOneAndUpdate(
      { userId, sessionId },
      diagramData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving diagram:', error);
    res.status(500).json({ error: 'Failed to save diagram' });
  }
});

router.post('/api/coaching/:sessionId/next-step', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { currentStep, diagramData } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    // Save the current progress
    await Diagram.findOneAndUpdate(
      { userId, sessionId },
      {
        $set: {
          currentStep,
          mermaidCode: diagramData.mermaidCode,
          reactFlowData: diagramData.reactFlowData,
        }
      },
      { upsert: true }
    );

    // Determine the next step based on your workflow
    const nextStep = await determineNextStep(sessionId, currentStep);

    res.json({ 
      success: true,
      nextStep,
      // Include any additional data needed for the next step
    });
  } catch (error) {
    console.error('Error processing next step:', error);
    res.status(500).json({ error: 'Failed to process next step' });
  }
});

// Helper function to determine the next step
async function determineNextStep(sessionId, currentStep) {
  // Implement your logic to determine the next step
  // This might involve checking the session type, progress, etc.
  return {
    step: currentStep + 1,
    // Add any additional step-specific data
  };
}

module.exports = router;