// server/routes/coaching.js
const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const coachEngine = require('../services/coaching/coachEngine');
const claudeService = require('../services/ai/claudeService');

// In-memory storage for sessions (fallback when DB not available)
const sessions = {};

// Get all coaching problems
router.get('/problems', async (req, res) => {
  console.log('GET request for coaching session problems');
  
  try {
    // Try to fetch problems from the database
    const problems = await Problem.find({ 
      $or: [{ type: 'coaching' }, { type: 'both' }] 
    });
    
    console.log(`Found ${problems.length} problems in database`);
    
    // If problems exist in DB, return them
    if (problems && problems.length > 0) {
      const formattedProblems = problems.map(problem => ({
        id: problem.id,
        title: problem.title,
        difficulty: problem.difficulty
      }));
      
      return res.json(formattedProblems);
    }
    
    // Fallback to mock data if no problems found
    console.log('No problems found, using fallback data');
    res.json([
      { id: 'url-shortener', title: 'URL Shortener Service', difficulty: 'intermediate' },
      { id: 'twitter', title: 'Twitter Clone', difficulty: 'advanced' },
      { id: 'parking-lot', title: 'Parking Lot System', difficulty: 'beginner' }
    ]);
  } catch (error) {
    console.error('Error fetching coaching problems:', error);
    // Fallback to mock data on error
    res.json([
      { id: 'url-shortener', title: 'URL Shortener Service', difficulty: 'intermediate' },
      { id: 'twitter', title: 'Twitter Clone', difficulty: 'advanced' },
      { id: 'parking-lot', title: 'Parking Lot System', difficulty: 'beginner' }
    ]);
  }
});

// Start a new coaching session
router.post('/start/:problemId', async (req, res) => {
  const { problemId } = req.params;
  
  try {
    const problem = await Problem.findOne({ id: problemId }) || {};
    
    const welcomeMessage = problem.promptSequence && problem.promptSequence[0] 
      ? problem.promptSequence[0].question 
      : `Welcome to your ${problem.title || 'System Design'} design session! Let's get started.`;
    
    const newSession = {
      id: problemId,
      problem: {
        id: problemId,
        title: problem.title || 'System Design Problem'
      },
      conversation: [{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString()
    };
    
    sessions[problemId] = newSession;
    
    return res.status(201).json(newSession);
  } catch (error) {
    console.error('Error starting coaching session:', error);
    res.status(500).json({ error: 'Failed to start coaching session' });
  }
});

// Get a coaching session by ID
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  try {
    // Try to get session from database
    try {
      const session = await Interview.findById(sessionId);
      if (session) {
        return res.json({
          id: session._id,
          problem: {
            id: session.problemId,
            title: session.problemTitle || 'System Design Problem'
          },
          conversation: session.conversation,
          currentStage: session.currentStage,
          createdAt: session.startedAt
        });
      }
    } catch (dbError) {
      console.log('DB session fetch failed, checking in-memory');
    }
    
    // Fallback to in-memory session
    const session = sessions[sessionId];
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching coaching session:', error);
    res.status(500).json({ error: 'Failed to get coaching session' });
  }
});

// Send a message in a coaching session
// Send a message in a coaching session
router.post('/:sessionId/message', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, contextInfo } = req.body;
    
    console.log(`Processing message for session ${sessionId}:`, message);
    
    // Validate input
    if (!message || typeof message !== 'string') {
      console.error('Invalid message format:', message);
      return res.status(400).json({ 
        error: 'Message is required',
        message: {
          role: 'coach',
          content: "I couldn't understand your message. Could you please try again?",
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Get session from memory
    const session = sessions[sessionId];
    if (!session) {
      return res.status(404).json({ 
        error: 'Session not found',
        message: {
          role: 'coach',
          content: "I couldn't find your session. Let's try starting a new one.",
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Add user message
    session.conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Prepare messages for Claude
    const messages = session.conversation.map(msg => ({
      role: msg.role === 'coach' ? 'assistant' : msg.role,
      content: msg.content
    }));
    
    // Create system prompt, include diagram context if provided
    let systemPrompt = `You are a system design coach helping the user design ${session.problem?.title || 'a system'}.
        Provide clear, concise educational guidance about system design concepts.
        Give specific recommendations rather than just asking questions.
        Keep your responses brief and focused.
        Use code blocks with proper syntax highlighting when showing code examples.`;
    
    if (session.problem && session.problem.description) {
      systemPrompt += `\n\nThe problem statement is: ${session.problem.description}`;
    }
    
    // Add diagram context if available
    if (contextInfo && contextInfo.diagramContext) {
      systemPrompt += `\n\nThe user has shared a system diagram with you. Here is the Mermaid code representation:
      \`\`\`
      ${contextInfo.diagramContext.mermaidCode}
      \`\`\`
      
      Please reference this diagram in your response.
      ${contextInfo.requestDiagramFeedback ? 'Provide specific feedback on the diagram and suggest improvements.' : ''}`;
    }
    
    // Get response from Claude
    try {
      const claudeResponse = await claudeService.sendMessage(messages, {
        system: systemPrompt
      });
      
      // Add coach response
      const responseMsg = {
        role: 'coach',
        content: claudeResponse,
        timestamp: new Date().toISOString()
      };
      
      session.conversation.push(responseMsg);
      
      // Generate diagram suggestions if requested
      let diagramSuggestions = null;
      if (contextInfo && (contextInfo.requestDiagramSuggestions || contextInfo.requestDiagramFeedback)) {
        try {
          diagramSuggestions = await coachEngine.generateDiagramDescription(sessionId, 'architecture');
        } catch (suggestErr) {
          console.error("Error generating diagram suggestions:", suggestErr);
        }
      }
      
      res.json({ message: responseMsg, diagramSuggestions });
    } catch (aiError) {
      console.error('Error getting AI response:', aiError);
      
      // Provide a fallback response
      const errorMsg = {
        role: 'coach',
        content: "I'm having trouble connecting to my knowledge base right now. Let's try to continue our discussion in a moment.",
        timestamp: new Date().toISOString(),
        error: true
      };
      
      session.conversation.push(errorMsg);
      res.json({ message: errorMsg });
    }
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

// Helper function to generate diagram suggestions
async function generateDiagramSuggestions(session, message, currentDiagram) {
  // Implementation depends on your AI setup
  // This could call Claude or another AI service with specialized prompting
  // Return an object with at least a mermaidCode property
  return {
    mermaidCode: '...' // Generated suggestion
  };
}

// Generate learning materials for a specific topic
router.post('/:sessionId/materials', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const materials = await coachEngine.generateLearningMaterials(sessionId, topic);
    res.json(materials);
  } catch (error) {
    console.error('Error generating learning materials:', error);
    res.status(500).json({ error: 'Failed to generate materials' });
  }
});

// Generate a diagram description for the coaching session
router.post('/:sessionId/diagram', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { diagramType } = req.body;
    
    if (!diagramType) {
      return res.status(400).json({ error: 'Diagram type is required' });
    }
    
    const diagram = await coachEngine.generateDiagramDescription(sessionId, diagramType);
    res.json(diagram);
  } catch (error) {
    console.error('Error generating diagram:', error);
    res.status(500).json({ error: 'Failed to generate diagram' });
  }
});

module.exports = router;
