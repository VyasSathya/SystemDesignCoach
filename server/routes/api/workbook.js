const express = require('express');
const router = express.Router();
const workbookService = require('../../services/workbook/workbookService');
const auth = require('../../middleware/auth');

// Public health check endpoint (no auth required)
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

// All other routes require authentication
router.use(auth);

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('Workbook router:', {
    method: req.method,
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
  next();
});

// POST /api/workbook/sync
router.post('/sync', auth, async (req, res) => {
  try {
    const { type, userId, problemId, data, subType } = req.body;
    
    console.log('Processing sync request:', {
      type,
      userId,
      problemId,
      subType,
      data: data ? 'present' : 'missing'
    });

    let result;
    switch (type) {
      case 'diagram':
        result = await workbookService.saveDiagram(
          req.user.id,
          problemId,
          subType,
          data
        );
        break;
      case 'chat':
        result = await workbookService.saveChat(
          req.user.id,
          problemId,
          data
        );
        break;
      case 'progress':
        result = await workbookService.saveProgress(
          req.user.id,
          problemId,
          data
        );
        break;
      default:
        throw new Error(`Invalid sync type: ${type}`);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/workbook/:problemId
router.get('/:problemId', auth, async (req, res) => {
  try {
    const workbook = await workbookService.getWorkbook(
      req.user.id,
      req.params.problemId
    );
    res.json(workbook);
  } catch (error) {
    console.error('Get workbook error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


