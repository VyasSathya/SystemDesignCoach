// server/routes/coaching.js
const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const Interview = require('../models/Interview');
const ClaudeService = require('../services/ai/claudeService');

const sessions = {};

router.get('/problems', async (req, res) => {
  console.log('GET request for coaching problems');
  try {
    const problems = await Problem.find({ $or: [{ type: 'coaching' }, { type: 'both' }] });
    if (problems && problems.length > 0) {
      const formatted = problems.map(p => ({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty
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

router.post('/start/:problemId', async (req, res) => {
  const { problemId } = req.params;
  const { userId } = req.body || {};
  try {
    const problem = await Problem.findOne({ id: problemId }) || {};
    const welcomeMessage = (problem.promptSequence && problem.promptSequence[0])
      ? problem.promptSequence[0].question
      : `Welcome to your ${problem.title || 'System Design'} session! Let's get started.`;
    const newSession = {
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
    sessions[problemId] = newSession;
    return res.status(201).json(newSession);
  } catch (error) {
    console.error('Error starting coaching session:', error);
    res.status(500).json({ error: 'Failed to start coaching session' });
  }
});

router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  console.log(`GET request for coaching session ${sessionId}`);
  try {
    let session = await Interview.findOne({ id: sessionId });
    if (!session) {
      session = sessions[sessionId];
    }
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    console.error('Error fetching coaching session:', error);
    res.status(500).json({ error: 'Failed to get coaching session' });
  }
});

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
    
    const session = sessions[sessionId];
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
    
    session.conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    });
    
    // Create a fresh Claude instance with unique timestamp
    const uniqueClaude = new ClaudeService({ timestamp: Date.now(), maxRetries: 5 });
    const recentMessages = [{ role: 'user', content: message }];
    
    let systemPrompt;
    if (message.toLowerCase().includes('performance') ||
        message.toLowerCase().includes('security') ||
        message.toLowerCase().includes('compliance')) {
      systemPrompt = `You are an expert system design coach.
Please provide a detailed answer covering performance requirements (QPS, latency, throughput, availability), security considerations, and compliance requirements if applicable.
Focus on this question: "${message}"
Timestamp: ${Date.now()}`;
    } else {
      systemPrompt = `You are an expert system design coach.
Please provide a detailed answer to:
"${message}"
Timestamp: ${Date.now()}`;
    }
    
    console.log("System Prompt (first 50 chars):", systemPrompt.substring(0, 50) + '...');
    const aiResponse = await uniqueClaude.sendMessage(recentMessages, {
      system: systemPrompt,
      systemPrompt: systemPrompt,
      temperature: 0.8
    });
    
    console.log('Claude response received:', aiResponse ? aiResponse.substring(0, 50) + '...' : 'No response');
    const responseMsg = {
      role: 'coach',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    session.conversation.push(responseMsg);
    
    res.json({ message: responseMsg, diagramSuggestions: null });
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

module.exports = router;
