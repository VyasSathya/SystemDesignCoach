const express = require('express');
const Session = require('../models/Session');
const Problem = require('../models/Problem');
const User = require('../models/User');
const Workbook = require('../models/Workbook');
const { getAIService } = require('../services/ai');
const logger = require('../utils/logger');

const router = express.Router();

// Create or update session
router.post('/:problemId', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    const { messages, currentStage, diagram } = req.body;
    
    // Find or create session
    let sessionDoc = await Session.findOne({ 
      userId, 
      problemId,
      completed: false
    }).session(session);
    
    if (!sessionDoc) {
      sessionDoc = new Session({
        userId,
        problemId,
        messages: [],
        currentStage: 0
      });
    }
    
    // Update session data
    if (messages) sessionDoc.messages = messages;
    if (currentStage !== undefined) sessionDoc.currentStage = currentStage;
    
    // Create or update associated workbook
    let workbook = await Workbook.findOne({ sessionId: sessionDoc._id }).session(session);
    if (!workbook) {
      workbook = new Workbook({
        sessionId: sessionDoc._id,
        userId,
        diagram
      });
    } else if (diagram) {
      workbook.diagram = diagram;
    }
    
    await workbook.save({ session });
    sessionDoc.workbook = workbook._id;
    await sessionDoc.save({ session });
    
    // Update user progress
    const user = await User.findById(userId).session(session);
    await user.updateProgress(sessionDoc);
    
    if (!user.activeSessions.includes(sessionDoc._id)) {
      user.activeSessions.push(sessionDoc._id);
    }
    if (!user.workbooks.includes(workbook._id)) {
      user.workbooks.push(workbook._id);
    }
    
    await user.save({ session });
    await session.commitTransaction();
    
    res.json({ 
      session: sessionDoc,
      workbook,
      progress: user.progress
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error('Update session error:', error);
    res.status(500).json({ error: 'Failed to update session' });
  } finally {
    session.endSession();
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