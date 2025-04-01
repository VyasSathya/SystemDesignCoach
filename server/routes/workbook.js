const express = require('express');
const router = express.Router();
const workbookDiagramService = require('../services/workbook/workbookDiagramService');
const auth = require('../middleware/auth');
const Workbook = require('../models/Workbook');

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

// Route to get workbook data for a specific problem ID
router.get('/:problemId', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id; // Get user ID from auth middleware

    console.log(`Fetching workbook data for user: ${userId}, problem: ${problemId}`);

    // Find the workbook document. Assuming a schema like { userId, problemId, sections, diagrams, progress, ... }
    const workbookData = await Workbook.findOne({ userId, problemId });

    if (!workbookData) {
      console.log(`No workbook data found for user: ${userId}, problem: ${problemId}`);
      // If no data exists, return an empty structure or default state
      // consistent with what the frontend expects (e.g., empty sections/diagrams)
      return res.status(200).json({
        sections: {},
        diagrams: {},
        progress: {},
        chat: [] // Or fetch chat separately if stored differently
        // Add other fields as needed based on your Workbook model
      });
    }

    console.log(`Workbook data found for user: ${userId}, problem: ${problemId}`);
    // Return the relevant parts of the workbook data
    res.status(200).json({
      sections: workbookData.sections || {},
      diagrams: workbookData.diagrams || {},
      progress: workbookData.progress || {},
      chat: workbookData.chat || [] 
      // Add other fields as needed
    });

  } catch (error) {
    console.error('Error fetching workbook data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error fetching workbook data'
    });
  }
});

// Route to save workbook data for a specific problem ID
router.post('/:problemId/save', auth, async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;
    // The frontend sends the data object containing sections, diagrams, progress
    const { data } = req.body; 

    if (!data) {
      return res.status(400).json({ success: false, error: 'Missing data in request body' });
    }

    console.log(`Saving workbook data for user: ${userId}, problem: ${problemId}`);

    // Prepare the update object. Only update fields present in the request data.
    const updateData = {};
    if (data.sections) updateData.sections = data.sections;
    if (data.diagrams) updateData.diagrams = data.diagrams;
    if (data.progress) updateData.progress = data.progress;
    // Add other fields if the frontend sends them
    // updateData.chat = data.chat; 

    updateData.lastUpdated = new Date(); // Update timestamp

    // Find the document and update it, or create it if it doesn't exist (upsert)
    const updatedWorkbook = await Workbook.findOneAndUpdate(
      { userId, problemId }, // Find criteria
      { 
        $set: updateData, // Apply updates
        $setOnInsert: { userId, problemId, createdAt: new Date() } // Set these fields only on insert
      },
      { 
        new: true, // Return the updated document
        upsert: true // Create if doesn't exist
      }
    );

    console.log(`Workbook data saved/updated successfully for user: ${userId}, problem: ${problemId}`);
    res.status(200).json({ success: true, data: updatedWorkbook });

  } catch (error) {
    console.error('Error saving workbook data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error saving workbook data'
    });
  }
});

module.exports = router;
