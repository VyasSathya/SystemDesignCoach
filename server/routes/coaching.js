const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Session = require('../models/Session');
const Problem = require('../models/Problem');
const coachEngine = require('../services/engines/coachEngine'); 

// Get all coaching problems
router.get('/problems', auth, async (req, res) => {
  try {
    // Load problems directly from the data file
    const problems = require('../../data/problems');
    res.json({ success: true, problems });
  } catch (error) {
    console.error('Error fetching coaching problems:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Start new coaching session
router.post('/sessions', auth, async (req, res) => {
  try {
    const { problemId } = req.body;
    const userId = req.user.id;

    const session = await coachEngine.startSession(userId, problemId);
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error creating coaching session:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get session by ID with better error handling
router.get('/sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found' 
      });
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    });
  }
});

// Add message endpoint
router.post('/sessions/:id/message', auth, async (req, res) => {
  try {
    const { message, options } = req.body;
    const response = await coachEngine.processMessage(req.params.id, message, options);
    res.json({ success: true, response });
  } catch (error) {
    console.error('Error in coaching message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;