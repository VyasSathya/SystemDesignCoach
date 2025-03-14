const AIFactory = require('../ai/aiFactory');
const logger = require('../../utils/logger');

class CoachingService {
  constructor() {
    this.ai = AIFactory.createService();
  }

  async processMessage(sessionId, message, context = {}) {
    try {
      const messages = [{
        role: 'user',
        content: message
      }];

      // Add context to system prompt if available
      const systemPrompt = context.topic ? 
        `You are an expert system design coach focusing on ${context.topic}. ${aiConfig.claude.defaultSystemPrompt}` :
        aiConfig.claude.defaultSystemPrompt;

      const response = await this.ai.sendMessage(messages, {
        systemPrompt,
        context
      });

      await this._logInteraction(sessionId, message, response);
      return response;
    } catch (error) {
      logger.error('Coaching Service Error:', error);
      throw new Error('Failed to process coaching message');
    }
  }

  async analyzeDiagram(sessionId, diagram) {
    try {
      const analysis = await this.ai.analyzeDiagram(diagram, {
        sessionId,
        context: 'coaching'
      });

      await this._logInteraction(sessionId, 'Diagram Analysis Request', analysis);
      return analysis;
    } catch (error) {
      logger.error('Diagram Analysis Error:', error);
      throw new Error('Failed to analyze diagram');
    }
  }

  async _logInteraction(sessionId, input, output) {
    // Implement logging logic here
    logger.info('Coaching Interaction', {
      sessionId,
      input: input.substring(0, 100) + '...',
      outputLength: output.length
    });
  }
}

module.exports = new CoachingService();