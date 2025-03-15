const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Problem = require('../../models/Problem');
const logger = require('../../utils/logger');

// Get all available problems
router.get('/problems', auth, async (req, res) => {
  try {
    // Fallback data in case database is empty
    const defaultProblems = [
      {
        id: "url-shortener",
        title: "Design a URL Shortener",
        difficulty: "intermediate",
        description: "Create a service that takes long URLs and creates unique short URLs, similar to TinyURL or bit.ly.",
        estimatedTime: 45
      },
      {
        id: "social-feed",
        title: "Design a Social Media Feed",
        difficulty: "advanced",
        description: "Design a news feed system that can handle millions of users posting and viewing content in real-time.",
        estimatedTime: 60
      }
    ];

    let problems;
    
    try {
      problems = await Problem.find().select('-evaluation');
      
      // If no problems in DB, use default ones
      if (!problems || problems.length === 0) {
        problems = defaultProblems;
      }
    } catch (dbError) {
      logger.warn('Database error, falling back to default problems:', dbError);
      problems = defaultProblems;
    }

    res.json({ success: true, problems });
  } catch (error) {
    logger.error('Error in /problems route:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error',
      message: error.message 
    });
  }
});

module.exports = router;