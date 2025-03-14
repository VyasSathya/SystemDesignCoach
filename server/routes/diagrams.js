const express = require('express');
const router = express.Router();
const DiagramEvaluationService = require('../services/diagram/diagramEvaluationService');
const auth = require('../middleware/auth');

router.post('/evaluate', auth, async (req, res) => {
  try {
    const { sessionId, diagram, context } = req.body;
    
    const evaluation = await DiagramEvaluationService.evaluateDiagram(
      diagram,
      diagram.type,
      {
        ...context,
        userId: req.user.id,
        sessionId
      }
    );

    res.json(evaluation);
  } catch (error) {
    console.error('Diagram evaluation error:', error);
    res.status(500).json({ error: 'Failed to evaluate diagram' });
  }
});

module.exports = router;