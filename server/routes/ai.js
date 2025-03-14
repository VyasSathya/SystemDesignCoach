const express = require('express');
const router = express.Router();
const coachingService = require('../services/coaching/coachingService');
const logger = require('../utils/logger');

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;
    const response = await coachingService.processMessage(sessionId, message, context);
    res.json({ success: true, response });
  } catch (error) {
    logger.error('AI Message Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze-diagram', async (req, res) => {
  try {
    const { sessionId, diagram } = req.body;
    const analysis = await coachingService.analyzeDiagram(sessionId, diagram);
    res.json({ success: true, analysis });
  } catch (error) {
    logger.error('Diagram Analysis Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/review-code', async (req, res) => {
  try {
    const { code, context } = req.body;
    const review = await coachingService.reviewCode(code, context);
    res.json({ success: true, review });
  } catch (error) {
    logger.error('Code Review Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;