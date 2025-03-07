// server/routes/interviews.js
const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const Problem = require('../models/Problem'); 
const interviewEngine = require('../services/interview/interviewEngine');
const diagramService = require('../services/diagram/diagramService');

// Centralized error handling middleware
const handleError = (res, error, defaultMessage = 'An unexpected error occurred') => {
  console.error('Route Error:', error);
  res.status(error.status || 500).json({ 
    error: error.message || defaultMessage,
    details: error.details || error.toString()
  });
};

// Logging middleware
router.use((req, res, next) => {
  console.log(`[Interviews] ${req.method} ${req.path} - User: ${req.user?.id || 'Unauthenticated'}`);
  next();
});

// Get interview problems - THIS ROUTE MUST MATCH THE CLIENT'S EXPECTATIONS
router.get('/problems', async (req, res) => {
  try {
    console.log('Fetching interview problems');
    
    // Try to find interview problems first
    let problems = await Problem.find({ 
      $or: [
        { type: 'interview' }, 
        { type: 'both' }
      ]
    });
    
    // If no problems with type field, look for any problems
    if (!problems || problems.length === 0) {
      problems = await Problem.find();
      
      if (!problems || problems.length === 0) {
        console.log('No problems found, returning 404');
        return res.status(404).json({ 
          error: 'No Problems Found', 
          details: 'No interview problems are currently available' 
        });
      }
      
      console.log(`Found ${problems.length} general problems, using as fallback`);
    } else {
      console.log(`Found ${problems.length} interview problems`);
    }

    res.json({ problems });
  } catch (error) {
    console.error('Interview problems error:', error);
    handleError(res, error, 'Failed to retrieve interview problems');
  }
});

// Get all interviews for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to access interviews' 
      });
    }

    const interviews = await Interview.find({ 
      userId, 
      type: 'interview'
    }).sort({ startedAt: -1 });

    res.json({ interviews });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve interviews');
  }
});

// Start a new interview
router.post('/start', async (req, res) => {
  try {
    const { problemId } = req.body;
    const userId = req.user?.id;

    // Validate authentication
    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to start an interview' 
      });
    }

    // Validate problem ID
    if (!problemId) {
      return res.status(400).json({ 
        error: 'Invalid Problem', 
        details: 'A valid problem ID is required' 
      });
    }

    // Find problem - don't check type to ensure compatibility
    const problem = await Problem.findOne({ id: problemId });
    if (!problem) {
      return res.status(404).json({ 
        error: 'Problem Not Found', 
        details: `No problem exists with ID: ${problemId}` 
      });
    }

    // Start interview using interview engine
    const interview = await interviewEngine.startInterview(userId, problemId);
    
    console.log(`Interview started: ${interview._id}`);
    res.status(201).json({ interview });
  } catch (error) {
    console.error('Interview start error:', error);
    handleError(res, error, 'Failed to start interview');
  }
});

// Get recent interview
router.get('/recent', async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to access recent interviews' 
      });
    }

    const recentInterview = await Interview.findOne({ 
      userId, 
      status: 'in_progress',
      type: 'interview'
    }).sort({ startedAt: -1 });

    if (!recentInterview) {
      return res.status(404).json({ 
        error: 'No Recent Interview', 
        details: 'You have no ongoing interviews' 
      });
    }

    res.json({ interview: recentInterview });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve recent interview');
  }
});

// Get interview by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to access interviews' 
      });
    }

    // For demo scenarios, handle ID=1 specially
    if (id === '1') {
      // Find most recent interview or return a mock
      const interview = await Interview.findOne({
        userId,
        type: 'interview',
        status: 'in_progress'
      }).sort({ startedAt: -1 });

      if (interview) {
        return res.json({ interview });
      }

      // Create a mock interview response for demo purposes
      return res.json({
        interview: {
          _id: '1',
          status: 'in_progress',
          currentStage: 'intro',
          conversation: [
            {
              role: 'interviewer',
              content: "Let's design a URL shortening service like TinyURL. Could you start by explaining the requirements and constraints as you understand them?",
              timestamp: new Date()
            }
          ]
        }
      });
    }

    // Regular interview lookup by ID
    const interview = await Interview.findById(id);
    
    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview Not Found', 
        details: 'No matching interview found' 
      });
    }

    // Ensure user owns this interview
    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        details: 'You do not have permission to view this interview' 
      });
    }

    res.json({ interview });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve interview');
  }
});

// Send message in interview
router.post('/:id/message', async (req, res) => {
  try {
    const { message } = req.body;
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to send messages' 
      });
    }

    if (!message) {
      return res.status(400).json({ 
        error: 'Invalid Message', 
        details: 'Message content is required' 
      });
    }

    // Find interview
    let interview;
    if (id === '1') {
      interview = await Interview.findOne({ 
        userId, 
        status: 'in_progress',
        type: 'interview'
      }).sort({ startedAt: -1 });
      
      // If no interview found, create a mock one for demo
      if (!interview) {
        const problem = await Problem.findOne({ id: 'url-shortener' });
        if (problem) {
          interview = await interviewEngine.startInterview(userId, problem.id);
        }
      }
    } else {
      // Validate MongoDB ID format
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ 
          error: 'Invalid Interview ID', 
          details: 'The provided interview ID is not valid' 
        });
      }

      interview = await Interview.findById(id);
    }

    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview Not Found', 
        details: 'No matching interview found' 
      });
    }

    // Ensure user owns this interview
    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        details: 'You do not have permission to access this interview' 
      });
    }

    const processedInterview = await interviewEngine.processResponse(interview._id, message);
    res.json({ interview: processedInterview });
  } catch (error) {
    handleError(res, error, 'Failed to process interview message');
  }
});

// Complete interview
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to complete interviews' 
      });
    }

    let interview;
    if (id === '1') {
      interview = await Interview.findOne({ 
        userId, 
        status: 'in_progress',
        type: 'interview'
      }).sort({ startedAt: -1 });
    } else {
      interview = await Interview.findById(id);
    }

    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview Not Found', 
        details: 'No matching interview found' 
      });
    }

    // Ensure user owns this interview
    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        details: 'You do not have permission to access this interview' 
      });
    }

    // Skip if already completed
    if (interview.status === 'completed') {
      return res.json({ interview });
    }

    const completedInterview = await interviewEngine.finalizeInterview(interview);
    res.json({ interview: completedInterview });
  } catch (error) {
    handleError(res, error, 'Failed to complete interview');
  }
});

// Get interview results
router.get('/:id/results', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to view results' 
      });
    }

    let interview;
    if (id === '1') {
      interview = await Interview.findOne({ 
        userId, 
        type: 'interview'
      }).sort({ startedAt: -1 });
    } else {
      interview = await Interview.findById(id);
    }

    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview Not Found', 
        details: 'No matching interview found' 
      });
    }

    // Ensure user owns this interview
    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        details: 'You do not have permission to access these results' 
      });
    }

    // If not completed, try to complete it first
    if (interview.status !== 'completed') {
      try {
        interview = await interviewEngine.finalizeInterview(interview);
      } catch (evalError) {
        console.error('Auto-evaluation error:', evalError);
      }
    }

    res.json({
      results: interview.evaluation || {
        score: 0,
        feedback: 'No evaluation available yet.',
        strengths: [],
        weaknesses: [],
        areas_to_improve: []
      },
      conversation: interview.conversation
    });
  } catch (error) {
    handleError(res, error, 'Failed to retrieve interview results');
  }
});

// Generate diagram for interview
router.post('/:id/diagram', async (req, res) => {
  try {
    const { id } = req.params;
    const { diagramType = 'architecture', customPrompt = null } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication Required', 
        details: 'You must be logged in to generate diagrams' 
      });
    }

    // Find interview
    let interview;
    if (id === '1') {
      interview = await Interview.findOne({ 
        userId, 
        status: 'in_progress',
        type: 'interview'
      }).sort({ startedAt: -1 });
    } else {
      interview = await Interview.findById(id);
    }

    if (!interview) {
      return res.status(404).json({ 
        error: 'Interview Not Found', 
        details: 'No matching interview found' 
      });
    }

    // Ensure user owns this interview
    if (interview.userId.toString() !== userId) {
      return res.status(403).json({ 
        error: 'Access Denied', 
        details: 'You do not have permission to access this interview' 
      });
    }

    // Generate diagram
    const diagram = await diagramService.generateDiagram(
      interview._id,
      diagramType,
      customPrompt
    );

    // Add the diagram to the interview
    if (!interview.diagrams) {
      interview.diagrams = [];
    }
    
    interview.diagrams.push({
      type: diagram.type,
      mermaidCode: diagram.mermaidCode,
      description: diagram.description,
      timestamp: new Date()
    });
    
    await interview.save();

    res.json({ diagram });
  } catch (error) {
    console.error('Diagram generation error:', error);
    handleError(res, error, 'Failed to generate diagram');
  }
});

// Get available diagram types
router.get('/diagram/types', async (req, res) => {
  try {
    res.json({ types: diagramService.TYPES });
  } catch (error) {
    handleError(res, error, 'Failed to get diagram types');
  }
});

module.exports = router;