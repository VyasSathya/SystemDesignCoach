const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { WorkbookService } = require('../../services/workbook/workbookService');

const workbookService = new WorkbookService();

// Protected route - requires authentication
router.post('/:sessionId/save', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await workbookService.saveWorkbook(sessionId, req.body, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;  // Export the router, not an object

