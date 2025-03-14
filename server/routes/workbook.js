const express = require('express');
const router = express.Router();
const Workbook = require('../models/Workbook');
const Diagram = require('../models/Diagram');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Save complete workbook including diagrams
router.post('/:sessionId/save', async (req, res) => {
  const { sessionId } = req.params;
  const { 
    userId, 
    apis, 
    apiType, 
    requirements, 
    architecture,
    diagrams 
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update workbook
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
      { upsert: true, new: true, session }
    );

    // Handle diagrams if present
    if (diagrams && diagrams.length > 0) {
      // Delete existing diagrams for this session
      await Diagram.deleteMany({ sessionId }, { session });

      // Create new diagrams
      const diagramDocs = diagrams.map(diagram => ({
        userId,
        sessionId,
        type: diagram.type,
        mermaidCode: diagram.mermaidCode,
        reactFlowData: diagram.reactFlowData,
        name: diagram.name,
        version: diagram.version || 1
      }));

      await Diagram.insertMany(diagramDocs, { session });
    }

    await session.commitTransaction();
    logger.info(`Workbook and diagrams saved for session ${sessionId}`);
    res.json(workbook);

  } catch (error) {
    await session.abortTransaction();
    logger.error(`Error saving workbook for session ${sessionId}:`, error);
    res.status(500).json({ error: 'Failed to save workbook' });
  } finally {
    session.endSession();
  }
});

// Get complete workbook with diagrams
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    const [workbook, diagrams] = await Promise.all([
      Workbook.findOne({ sessionId }),
      Diagram.find({ sessionId })
    ]);

    if (!workbook) {
      return res.status(404).json({ error: 'Workbook not found' });
    }

    const response = {
      ...workbook.toObject(),
      diagrams: diagrams.map(d => d.toObject())
    };

    res.json(response);

  } catch (error) {
    logger.error(`Error fetching workbook ${sessionId}:`, error);
    res.status(500).json({ error: 'Failed to fetch workbook' });
  }
});

module.exports = router;