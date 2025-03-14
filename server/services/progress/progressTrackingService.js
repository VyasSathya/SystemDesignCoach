const Workbook = require('../../models/Workbook');
const workbookEvaluationService = require('../evaluation/workbookEvaluationService');

class ProgressTrackingService {
  async trackProgress(sessionId, userId) {
    const workbook = await Workbook.findOne({ sessionId });
    if (!workbook) throw new Error('Workbook not found');

    const evaluation = await workbookEvaluationService.evaluateProgress(sessionId);
    
    // Update progress in workbook
    workbook.progress = {
      completion: evaluation.overallProgress,
      sections: new Map(Object.entries(evaluation.evaluations)),
      lastUpdated: new Date()
    };

    await workbook.save();

    return {
      currentProgress: evaluation.overallProgress,
      sectionProgress: evaluation.evaluations,
      recommendations: evaluation.recommendations,
      timeline: await this.getProgressTimeline(sessionId)
    };
  }

  async getProgressTimeline(sessionId) {
    const workbook = await Workbook.findOne({ sessionId });
    if (!workbook) throw new Error('Workbook not found');

    return workbook.coachingInteractions.map(interaction => ({
      timestamp: interaction.timestamp,
      type: 'coaching',
      content: interaction.message
    }));
  }
}

module.exports = new ProgressTrackingService();