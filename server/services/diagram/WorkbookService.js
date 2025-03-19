const Workbook = require('../../models/Workbook');

class WorkbookService {
  async updateDiagramEvaluation(sessionId, evaluation) {
    try {
      const result = await Workbook.findOneAndUpdate(
        { sessionId },
        { 
          $set: {
            'diagrams.$[diagram].evaluation': evaluation
          }
        },
        {
          arrayFilters: [{ 'diagram.type': evaluation.type }],
          new: true
        }
      );
      return result;
    } catch (error) {
      console.error('Failed to update diagram evaluation:', error);
      throw error;
    }
  }

  async getDiagramEvaluation(sessionId, diagramType) {
    try {
      const workbook = await Workbook.findOne({ sessionId });
      if (!workbook) return null;
      
      const diagram = workbook.diagrams.find(d => d.type === diagramType);
      return diagram?.evaluation || null;
    } catch (error) {
      console.error('Failed to get diagram evaluation:', error);
      throw error;
    }
  }
}

module.exports = new WorkbookService();