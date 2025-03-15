const Workbook = require('../../models/Workbook');

class WorkbookDiagramService {
  async getDiagram(sessionId, diagramType) {
    const workbook = await Workbook.findOne({ sessionId });
    if (!workbook || !workbook.diagrams || !workbook.diagrams[diagramType]) {
      return null;
    }
    return workbook.diagrams[diagramType];
  }

  async saveDiagram(sessionId, diagramType, diagramData) {
    const update = {
      [`diagrams.${diagramType}`]: {
        type: diagramType,
        nodes: diagramData.nodes,
        edges: diagramData.edges,
        mermaidCode: diagramData.mermaidCode,
        'metadata.lastUpdated': new Date(),
        'metadata.version': 1
      }
    };

    return await Workbook.findOneAndUpdate(
      { sessionId },
      { $set: update },
      { new: true }
    );
  }
}

module.exports = new WorkbookDiagramService();