const express = require('express');
const Session = require('../models/Session');
const Problem = require('../models/Problem');
const User = require('../models/User');
const { getAIService } = require('../services/ai');

const router = express.Router();

// Create or update session
router.post('/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const { messages, currentStage, diagram } = req.body;
    
    // Find existing session or create new one
    let session = await Session.findOne({ 
      userId, 
      problemId,
      completed: false
    });
    
    if (!session) {
      session = new Session({
        userId,
        problemId,
        messages: [],
        currentStage: 0
      });
    }
    
    // Update session data
    if (messages) session.messages = messages;
    if (currentStage !== undefined) session.currentStage = currentStage;
    if (diagram) session.diagram = diagram;
    
    await session.save();
    
    // Update user progress
    const user = await User.findById(userId);
    await user.updateProgress(session);
    await user.save();
    
    res.json({ session });
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Send message to AI
router.post('/:problemId/message', async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const { message, previousMessages, currentStage, aiService } = req.body;
    
    // Get problem
    const problem = await Problem.findOne({ id: problemId });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Get AI service
    const ai = getAIService(aiService || 'claude');
    
    // Generate response
    const aiResponse = await ai.generateResponse(
      [...previousMessages, { role: 'user', content: message }],
      problem,
      currentStage
    );
    
    res.json(aiResponse);
  } catch (error) {
    console.error('AI message error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Generate diagram
router.post('/:problemId/diagram', async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const { messages, currentStage, aiService } = req.body;
    
    // Get problem
    const problem = await Problem.findOne({ id: problemId });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    
    // Get AI service
    const ai = getAIService(aiService || 'claude');
    
    // Generate diagram
    const diagram = await ai.generateDiagram(
      messages,
      problem,
      currentStage
    );
    
    res.json({ diagram });
  } catch (error) {
    console.error('Generate diagram error:', error);
    res.status(500).json({ error: 'Failed to generate diagram' });
  }
});

// Complete session
router.post('/:problemId/complete', async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    
    // Find session
    const session = await Session.findOne({ 
      userId, 
      problemId,
      completed: false
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Mark as completed
    session.completed = true;
    session.completedAt = Date.now();
    
    // Calculate score based on completeness
    const problem = await Problem.findOne({ id: problemId });
    const maxStage = problem.promptSequence.length - 1;
    const completionPercent = session.currentStage / maxStage;
    session.score = Math.round(completionPercent * 100);
    
    await session.save();
    
    // Update user progress
    const user = await User.findById(userId);
    user.progress.problemsCompleted += 1;
    await user.updateProgress(session);
    await user.save();
    
    res.json({ 
      success: true,
      score: session.score 
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Get user sessions/progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user data
    const user = await User.findById(userId);
    
    // Get in-progress sessions
    const inProgressSession = await Session.findOne({
      userId,
      completed: false
    }).sort('-lastUpdatedAt');
    
    // Get problem info for in-progress session
    let inProgressProblem = null;
    if (inProgressSession) {
      const problem = await Problem.findOne({ id: inProgressSession.problemId });
      if (problem) {
        inProgressProblem = {
          id: problem.id,
          title: problem.title,
          description: problem.description.substring(0, 100) + '...',
          percentComplete: inProgressSession.percentComplete,
          stages: problem.promptSequence.map((stage, index) => ({
            id: stage.id,
            name: stage.name,
            completed: index < inProgressSession.currentStage
          }))
        };
      }
    }
    
    // Calculate total problems
    const totalProblems = await Problem.countDocuments();
    
    res.json({
      problemsCompleted: user.progress.problemsCompleted,
      totalProblems,
      timeInvested: user.progress.timeInvested,
      currentStreak: user.progress.streak.current,
      bestStreak: user.progress.streak.best,
      inProgressProblem
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

module.exports = router;