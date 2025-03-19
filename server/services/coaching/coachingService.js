const { config } = require('../../config/aiConfig');
const logger = require('../../utils/logger');

class CoachingService {
  constructor(aiService) {
    this.ai = aiService;
  }

  async processMessage(sessionId, message, context = {}) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }

      const messages = [{
        role: 'user',
        content: message
      }];

      // Add context to system prompt if available
      const systemPrompt = context.topic ? 
        `You are an expert system design coach focusing on ${context.topic}. ${config.defaultSystemPrompt}` :
        config.defaultSystemPrompt;

      logger.info('Sending message to AI:', {
        sessionId,
        messageCount: messages.length,
        hasContext: !!context
      });

      const response = await this.ai.sendMessage(messages, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 1000,
        context
      });

      return {
        message: response,
        learningPatterns: {
          vocabularyLevel: "intermediate",
          conceptualUnderstanding: "good"
        }
      };
    } catch (error) {
      logger.error('Coaching Service Error:', error);
      throw new Error('Failed to process coaching message');
    }
  }
}

module.exports = { CoachingService };
