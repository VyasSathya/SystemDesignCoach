const BaseEngine = require('./baseEngine');
const skillEvaluationService = require('../skills/skillEvaluationService');
const skillProgressService = require('../skills/skillProgressService');

class CoachingEngine extends BaseEngine {
  constructor(config = {}) {
    super(config);
  }

  async processMessage(sessionId, message, options = {}) {
    const response = await super.processMessage(sessionId, message, options);

    // Evaluate skills if this is a significant interaction
    if (this._shouldEvaluateSkills(message, response)) {
      const evaluation = await skillEvaluationService.evaluateResponse(
        options.focusArea?.category || 'technical',
        options.focusArea?.skill || 'system_architecture',
        {
          userMessage: message,
          aiResponse: response,
          context: options.context
        },
        { type: 'dialogue' }
      );

      // Update user's skill progress
      if (options.userId) {
        await skillProgressService.updateProgress(
          options.userId,
          sessionId,
          { [options.focusArea?.skill]: evaluation }
        );
      }

      // Enhance response with skill feedback
      response.evaluation = evaluation;
    }

    return response;
  }

  async startSession(userId, contentId, options = {}) {
    const session = await super.startSession(userId, contentId, options);

    // Get skill roadmap for personalized coaching
    if (userId) {
      const roadmap = await skillProgressService.getSkillRoadmap(userId);
      if (roadmap) {
        session.context.skillRoadmap = roadmap;
      }
    }

    return session;
  }

  _shouldEvaluateSkills(message, response) {
    // Evaluate if message contains significant technical content
    return message.length > 100 || 
           message.includes('```') || 
           response.includes('diagram') ||
           response.includes('architecture');
  }
}

module.exports = CoachingEngine;