const BaseEngine = require('./base/BaseEngine');
const Workbook = require('../../models/Workbook');
const logger = require('../../utils/logger');

class CoachingEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
  }

  async processMessage(sessionId, message, options = {}) {
    try {
      // Fetch current workbook state
      const workbook = await Workbook.findOne({ sessionId });
      
      const context = {
        ...options,
        workbookState: {
          apis: workbook?.apis,
          apiType: workbook?.apiType,
          requirements: workbook?.requirements,
          architecture: workbook?.architecture,
          diagram: workbook?.diagram
        }
      };

      const response = await super.processMessage(sessionId, message, context);
      
      // Track coaching interaction
      await this._updateWorkbookProgress(sessionId, message, response);
      
      return response;
    } catch (error) {
      logger.error(`Error in coaching engine: ${error.message}`);
      throw error;
    }
  }

  async _updateWorkbookProgress(sessionId, message, response) {
    try {
      const workbook = await Workbook.findOne({ sessionId });
      if (!workbook) return;

      // Update last interaction
      await Workbook.findOneAndUpdate(
        { sessionId },
        {
          $push: {
            coachingInteractions: {
              timestamp: new Date(),
              message,
              response,
            }
          }
        }
      );
    } catch (error) {
      logger.error(`Error updating workbook progress: ${error.message}`);
    }
  }
}

module.exports = CoachingEngine;