const BaseEngine = require('./base/BaseEngine');
const WorkbookService = require('../../services/WorkbookService');
const WorkbookEvaluationService = require('../../services/WorkbookEvaluationService');
const logger = require('../../utils/logger');

class CoachingEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
    this.workbookService = new WorkbookService();
  }

  async processMessage(sessionId, message, options = {}) {
    try {
      // Get current workbook state including save status
      const workbook = await this.workbookService.getWorkbookWithStatus(sessionId);
      
      const context = {
        ...options,
        workbookState: {
          apis: workbook?.apis,
          apiType: workbook?.apiType,
          requirements: workbook?.requirements,
          architecture: workbook?.architecture,
          diagram: workbook?.diagram,
          saveStatus: workbook?.saveStatus,
          lastSaved: workbook?.lastSaved
        }
      };

      // Add save status to coaching context
      if (workbook?.saveStatus === 'error') {
        context.systemPrompt = `${context.systemPrompt}\nNote: There appear to be unsaved changes. Please remind the user to save their work.`;
      }

      const response = await super.processMessage(sessionId, message, context);
      
      // Track coaching interaction with save status
      await this._updateWorkbookProgress(sessionId, message, response, workbook?.saveStatus);
      
      return response;
    } catch (error) {
      logger.error(`Error in coaching engine: ${error.message}`);
      throw error;
    }
  }

  async _updateWorkbookProgress(sessionId, message, response, saveStatus) {
    try {
      const workbook = await this.workbookService.getWorkbook(sessionId);
      if (!workbook) return;

      // Update last interaction with save status
      await this.workbookService.updateWorkbook(sessionId, {
        $push: {
          coachingInteractions: {
            timestamp: new Date(),
            message,
            response,
            saveStatus
          }
        }
      });

      // Trigger evaluation if needed
      if (this._shouldTriggerEvaluation(message, workbook)) {
        await this._triggerEvaluation(sessionId, workbook);
      }
    } catch (error) {
      logger.error(`Error updating workbook progress: ${error.message}`);
    }
  }

  _shouldTriggerEvaluation(message, workbook) {
    // Implement logic to determine if we should evaluate
    const timeSinceLastEval = Date.now() - (workbook.lastEvaluation || 0);
    return timeSinceLastEval > 300000; // 5 minutes
  }

  async _triggerEvaluation(sessionId, workbook) {
    const evaluationService = new WorkbookEvaluationService();
    const evaluation = await evaluationService.evaluateWorkbook(sessionId);
    
    // Store evaluation results
    await this.workbookService.updateWorkbook(sessionId, {
      lastEvaluation: Date.now(),
      evaluationResults: evaluation
    });
  }
}

module.exports = CoachingEngine;