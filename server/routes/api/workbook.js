const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const WorkbookService = require('../../services/workbook/workbookService');

// Get all workbook data for a user
router.get('/all', auth, async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const workbook = await WorkbookService.getWorkbook(userId);
    
    res.json({
      problems: workbook?.problems || {},
      lastSynced: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching workbook data:', error);
    res.status(500).json({ error: 'Failed to fetch workbook data' });
  }
});

module.exports = router;


