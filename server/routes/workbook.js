const express = require('express');
const router = express.Router();
const workbookDiagramService = require('../services/workbook/workbookDiagramService');
const auth = require('../middleware/auth');

// Add auth middleware to ensure user is authenticated
router.post('/sync', auth, async (req, res) => {
  try {
    const { type, userId, problemId, data, subType } = req.body;
    
    // Verify user is syncing their own data
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    let result;
    switch (type) {
      case 'diagram':
        result = await workbookDiagramService.saveDiagram(
          userId,
          problemId,
          subType,
          data
        );
        break;
      case 'chat':
        result = await workbookService.saveChat(
          userId,
          problemId,
          data
        );
        break;
      case 'progress':
        result = await workbookService.saveProgress(
          userId,
          problemId,
          data
        );
        break;
      default:
        throw new Error('Invalid sync type');
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/diagram/:sessionId/:type', async (req, res) => {
  try {
    const { sessionId, type } = req.params;
    const diagram = await workbookDiagramService.getDiagram(sessionId, type);
    
    res.json({
      success: true,
      diagram
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
