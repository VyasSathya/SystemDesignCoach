const express = require('express');
const router = express.Router();
const Workbook = require('../models/Workbook');
const logger = require('../utils/logger');

router.post('/:sessionId/save', async (req, res) => {
  const { sessionId } = req.params;
  const { userId, apis, apiType, requirements, architecture } = req.body;

  try {
    const workbook = await Workbook.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        userId,
        apis,
        apiType,
        requirements,
        architecture,
        lastModified: new Date()
      },
      { upsert: true, new: true }
    );

    logger.info(`Workbook saved for session ${sessionId} by user ${userId}`);
    res.json(workbook);
  } catch (error) {
    logger.error(`Error saving workbook for session ${sessionId}: ${error.message}`);
    res.status(500).json({ error: 'Failed to save workbook' });
  }
});

module.exports = router;