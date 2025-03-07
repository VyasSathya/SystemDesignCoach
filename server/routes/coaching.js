// server/routes/coaching.js
const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Problem = require('../models/Problem'); 
const coachEngine = require('../services/coaching/coachEngine');
const diagramService = require('../services/diagram/diagramService');

router.use((req, res, next) => {
  console.log(`[Coaching] ${req.method} ${req.path}`);
  next();
});

// Get all coaching sessions for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Interview.find({ 
      userId: userId,
      type: 'coaching'
    }).sort({ startedAt: -1 });
    
    res.json({ sessions });
  } catch (error) {
    console.error('Failed to get coaching sessions:', error);
    res.status(500).json({ error: 'Failed to get coaching sessions' });
  }
});

// Get available coaching problems
router.get('/problems', async (req, res) => {
  try {
    const problems = await Problem.find({});
    res.json({ problems });
  } catch (error) {
    console.error('Failed to get coaching problems:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

// Start a new coaching session
router.post('/start/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    
    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }
    
    const session = await coachEngine.startCoachingSession(userId, problemId);
    res.status(201).json({ session });
  } catch (error) {
    console.error('Coaching session start error:', error);
    res.status(500).json({ error: 'Failed to start coaching session' });
  }
});

// Get coaching session by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    let session;
    
    if (id === '1') {
      // Find the most recent coaching session
      session = await Interview.findOne({
        userId: userId,
        type: 'coaching'
      }).sort({ startedAt: -1 });
      
      if (!session) {
        // Create a mock session for development if none exists
        session = {
          _id: '000000000000000000000001',
          userId: userId,
          type: 'coaching',
          status: 'in_progress',
          startedAt: new Date(),
          problemId: '1',
          currentStage: 'planning',
          conversation: [
            {
              role: 'coach',
              content: 'Welcome to your system design coaching session! What system would you like to design today?',
              timestamp: new Date()
            }
          ]
        };
      }
    } else if (/^[0-9a-fA-F]{24}$/.test(id)) {
      session = await Interview.findOne({
        _id: id,
        userId: userId,
        type: 'coaching'
      });
    } else {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }
    
    if (!session) {
      return res.status(404).json({ error: 'Coaching session not found' });
    }
    
    res.json({ session });
  } catch (error) {
    console.error('Get coaching session error:', error);
    res.status(500).json({ error: 'Failed to get coaching session' });
  }
});

// Send message in coaching session
router.post('/:id/message', async (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    let sessionId;
    
    if (id === '1') {
      // Find the most recent coaching session
      const session = await Interview.findOne({
        userId: userId,
        type: 'coaching',
        status: 'in_progress'
      }).sort({ startedAt: -1 });
      
      if (!session) {
        return res.status(404).json({ error: 'No active coaching session found' });
      }
      
      sessionId = session._id;
    } else if (/^[0-9a-fA-F]{24}$/.test(id)) {
      sessionId = id;
    } else {
      return res.status(400).json({ error: 'Invalid session ID format' });
    }
    
    const processedSession = await coachEngine.processResponse(sessionId, message);
    res.json({ session: processedSession });
  } catch (error) {
    console.error('Process coaching message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get learning materials
router.post('/:id/materials', async (req, res) => {
    try {
      const { topic } = req.body;
      const { id } = req.params;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }
      
      const materials = await coachEngine.generateLearningMaterials(id, topic);
      res.json({ materials });
    } catch (error) {
      console.error('Generate learning materials error:', error);
      res.status(500).json({ error: 'Failed to generate learning materials' });
    }
  });
  
  // Generate a diagram based on conversation
  router.post('/:id/diagram', async (req, res) => {
    try {
      const { id } = req.params;
      const { diagramType = 'architecture', customPrompt = null } = req.body;
      const userId = req.user.id;
  
      if (!userId) {
        return res.status(401).json({ 
          error: 'Authentication Required', 
          details: 'You must be logged in to generate diagrams' 
        });
      }
  
      // Find coaching session
      let session;
      
      if (id === '1') {
        session = await Interview.findOne({
          userId: userId,
          type: 'coaching',
          status: 'in_progress'
        }).sort({ startedAt: -1 });
      } else if (/^[0-9a-fA-F]{24}$/.test(id)) {
        session = await Interview.findOne({
          _id: id,
          userId: userId,
          type: 'coaching'
        });
      } else {
        return res.status(400).json({ error: 'Invalid session ID format' });
      }
  
      if (!session) {
        return res.status(404).json({ 
          error: 'Coaching Session Not Found', 
          details: 'No matching coaching session found' 
        });
      }
  
      // Generate diagram
      const diagram = await diagramService.generateDiagram(
        session._id,
        diagramType,
        customPrompt
      );
  
      // Add the diagram to the session
      if (!session.diagrams) {
        session.diagrams = [];
      }
      
      session.diagrams.push({
        type: diagram.type,
        mermaidCode: diagram.mermaidCode,
        description: diagram.description,
        timestamp: new Date()
      });
      
      await session.save();
  
      res.json({ diagram });
    } catch (error) {
      console.error('Coaching diagram error:', error);
      res.status(500).json({ error: 'Failed to generate diagram' });
    }
  });
  
  // Get diagrams from a coaching session
  router.get('/:id/diagrams', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
  
      if (!userId) {
        return res.status(401).json({ 
          error: 'Authentication Required', 
          details: 'You must be logged in to access diagrams' 
        });
      }
  
      let session;
      
      if (id === '1') {
        session = await Interview.findOne({
          userId: userId,
          type: 'coaching',
          status: 'in_progress'
        }).sort({ startedAt: -1 });
      } else if (/^[0-9a-fA-F]{24}$/.test(id)) {
        session = await Interview.findOne({
          _id: id,
          userId: userId,
          type: 'coaching'
        });
      } else {
        return res.status(400).json({ error: 'Invalid session ID format' });
      }
  
      if (!session) {
        return res.status(404).json({ 
          error: 'Coaching Session Not Found', 
          details: 'No matching coaching session found' 
        });
      }
  
      res.json({ diagrams: session.diagrams || [] });
    } catch (error) {
      console.error('Error fetching diagrams:', error);
      res.status(500).json({ 
        error: 'Failed to fetch diagrams', 
        details: error.message 
      });
    }
  });
  
  module.exports = router;