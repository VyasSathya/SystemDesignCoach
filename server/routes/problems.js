const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const logger = require('../utils/logger');

// Cache for problems to avoid frequent DB queries
let problemsCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function loadProblems() {
  try {
    if (problemsCache && lastCacheUpdate && (Date.now() - lastCacheUpdate) < CACHE_DURATION) {
      return problemsCache;
    }

    const problems = await Problem.find({ active: true })
      .select('id title difficulty category description tags')
      .sort({ difficulty: 1, category: 1 })
      .lean();

    problemsCache = problems;
    lastCacheUpdate = Date.now();
    return problems;
  } catch (error) {
    logger.error('Error loading problems:', error);
    throw error;
  }
}

router.get('/', async (req, res) => {
  try {
    const problems = await loadProblems();
    res.json(problems);
  } catch (error) {
    logger.error('Failed to fetch problems:', error);
    res.status(500).json({ error: 'Failed to fetch problems' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const problem = await Problem.findOne({ id: req.params.id });
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    logger.error(`Failed to fetch problem ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch problem' });
  }
});

module.exports = router;
