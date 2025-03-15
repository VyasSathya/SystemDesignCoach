const express = require('express');
const router = express.Router();
const DiagramAnalyzer = require('../services/diagram/diagramAnalyzer');
const DiagramManager = require('../services/diagram/diagramManager');

const analyzer = new DiagramAnalyzer();
const manager = new DiagramManager();

router.post('/analyze', async (req, res) => {
  try {
    const { nodes, edges } = req.body;
    const analysis = await analyzer.analyzeDiagram(nodes, edges);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing diagram:', error);
    res.status(500).json({ error: 'Failed to analyze diagram' });
  }
});

module.exports = router;