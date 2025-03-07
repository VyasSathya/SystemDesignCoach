const express = require('express');
const Problem = require('../models/Problem');
const Session = require('../models/Session');

const router = express.Router();

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().sort('difficulty');
    
    // Format for client
    const formattedProblems = problems.map(problem => ({
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      description: problem.description.substring(0, 150) + '...',
      estimatedTime: problem.estimatedTime
    }));
    
    res.json({ problems: formattedProblems });
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Failed to get problems' });
  }
});

// Get single problem
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Get problem and active session
    const problem = await Problem.findOne({ id });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    const session = await Session.findOne({ 
      userId, 
      problemId: id,
      completed: false
    }).sort('-startedAt');
    
    res.json({ 
      problem,
      session
    });
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Failed to get problem' });
  }
});

// Get recommended problems
router.get('/recommended', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's completed problems
    const completedSessions = await Session.find({
      userId,
      completed: true
    });
    
    const completedProblemIds = completedSessions.map(session => session.problemId);
    
    // Get two random problems the user hasn't completed
    const recommendedProblems = await Problem.find({
      id: { $nin: completedProblemIds }
    }).limit(2);
    
    res.json({ problems: recommendedProblems });
  } catch (error) {
    console.error('Get recommended problems error:', error);
    res.status(500).json({ error: 'Failed to get recommended problems' });
  }
});

module.exports = router;