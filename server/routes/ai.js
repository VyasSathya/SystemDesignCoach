const express = require('express');
const router = express.Router();
const { CoachingService } = require('../services/coaching/coachingService');
const logger = require('../utils/logger');

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const coachingService = new CoachingService();

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;
    
    logger.info('Processing AI message:', {
      sessionId,
      messagePreview: message.substring(0, 100),
      context
    });

    const response = await coachingService.processMessage(sessionId, message, context);
    
    res.json({ 
      success: true, 
      response 
    });
  } catch (error) {
    logger.error('AI Message Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;