const express = require('express');
const router = express.Router();
const DiagramAnalyzer = require('../services/diagram/diagramAnalyzer');
const DiagramService = require('../services/diagram/diagramService');
const { CoachEngine } = require('../services/CoachEngine');

const diagramAnalyzer = new DiagramAnalyzer();
const diagramService = new DiagramService();
const coachEngine = new CoachEngine();

router.post('/message', async (req, res) => {
  try {
    const { sessionId, message, context } = req.body;
    const response = await coachingService.processMessage(sessionId, message, context);
    res.json({ success: true, response });
  } catch (error) {
    logger.error('AI Message Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/analyze-diagram', async (req, res) => {
  try {
    const { sessionId, diagram } = req.body;
    const analysis = await coachingService.analyzeDiagram(sessionId, diagram);
    res.json({ success: true, analysis });
  } catch (error) {
    logger.error('Diagram Analysis Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/review-code', async (req, res) => {
  try {
    const { code, context } = req.body;
    const review = await coachingService.reviewCode(code, context);
    res.json({ success: true, review });
  } catch (error) {
    logger.error('Code Review Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/suggest-requirements', async (req, res) => {
  try {
    const { functionalReqs, nonFunctionalReqs, constraints, assumptions } = req.body;
    
    const context = {
      currentRequirements: {
        functional: functionalReqs,
        nonFunctional: nonFunctionalReqs,
        constraints,
        assumptions
      }
    };

    const suggestions = await coachEngine.generateSuggestions('requirements', context);
    
    res.json(suggestions);
  } catch (error) {
    console.error('Error generating requirements suggestions:', error);
    res.status(500).json({ error: 'Failed to generate suggestions' });
  }
});

router.post('/analyze-requirements-diagram', async (req, res) => {
  try {
    const { diagramData, requirements } = req.body;
    
    // Analyze diagram components and their relationship to requirements
    const analysis = await diagramAnalyzer.analyzeDiagram(
      diagramData.nodes,
      diagramData.edges,
      'system'
    );

    // Get suggestions for improving the diagram based on requirements
    const suggestions = await diagramService.generateSuggestions(
      diagramData,
      requirements
    );

    res.json({
      analysis,
      suggestions
    });
  } catch (error) {
    console.error('Error analyzing requirements diagram:', error);
    res.status(500).json({ error: 'Failed to analyze diagram' });
  }
});

module.exports = router;