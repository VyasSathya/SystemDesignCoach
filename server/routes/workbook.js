const workbookDiagramService = require('../services/workbook/workbookDiagramService');

router.post('/diagram/:sessionId/:type', async (req, res) => {
  try {
    const { sessionId, type } = req.params;
    const diagramData = req.body;
    
    const updatedWorkbook = await workbookDiagramService.saveDiagram(
      sessionId,
      type,
      diagramData
    );
    
    res.json({
      success: true,
      diagram: updatedWorkbook.diagrams[type]
    });
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