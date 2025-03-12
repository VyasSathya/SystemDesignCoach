// server/routes/grader.js
const express = require('express');
const router = express.Router();
const graderEngine = require('../services/engines/graderEngine');
const Evaluation = require('../models/Evaluation');
const auth = require('../middleware/auth');

// Route to evaluate current workbook
router.post('/evaluate/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { workbookContent, userLevel, conciseMode = true } = req.body;
    
    const result = await graderEngine.evaluateWorkbook(
      sessionId,
      workbookContent,
      { userLevel, conciseMode }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Grader evaluation error:', error);
    res.status(500).json({ 
      message: 'Error evaluating workbook', 
      error: error.message 
    });
  }
});

// Route to provide final assessment for an interview
router.post('/assessment/:interviewId', auth, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { userLevel, conciseMode = true } = req.body;
    
    const result = await graderEngine.provideFinalAssessment(
      interviewId,
      { userLevel, conciseMode }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Final assessment error:', error);
    res.status(500).json({ 
      message: 'Error generating final assessment', 
      error: error.message 
    });
  }
});

// Route to get saved evaluations for a session
router.get('/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find all evaluations for this session, sorted by timestamp
    const evaluations = await Evaluation.find({ sessionId })
      .sort({ timestamp: -1 });
    
    res.json({ evaluations });
  } catch (error) {
    console.error('Error retrieving evaluations:', error);
    res.status(500).json({ 
      message: 'Error retrieving evaluations', 
      error: error.message 
    });
  }
});

// Route to get the latest evaluation for a session
router.get('/latest/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Find the latest evaluation for this session
    const evaluation = await Evaluation.findOne({ sessionId })
      .sort({ timestamp: -1 });
    
    if (!evaluation) {
      return res.status(404).json({ message: 'No evaluations found' });
    }
    
    res.json({ evaluation });
  } catch (error) {
    console.error('Error retrieving latest evaluation:', error);
    res.status(500).json({ 
      message: 'Error retrieving evaluation', 
      error: error.message 
    });
  }
});

module.exports = router;