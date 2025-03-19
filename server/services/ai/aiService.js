const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('../../utils/logger');

class AIService {
  constructor(config) {
    if (!config.apiKey) {
      throw new Error('API key is required for AI service');
    }
    
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async sendMessage(messages, options = {}) {
    try {
      // Validate messages
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error('Invalid message format');
      }
      
      if (messages.some(m => !m.role || !m.content)) {
        throw new Error('Invalid message format');
      }

      const systemPrompt = options.systemPrompt || this.config.defaultSystemPrompt;

      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: options.maxTokens || this.config.maxTokens,
        messages: messages,
        system: systemPrompt,
        temperature: options.temperature || this.config.temperature,
      });

      return response.content[0].text;
    } catch (error) {
      logger.error('AI Service Error:', error);
      if (error.message === 'Invalid message format') {
        throw error;
      }
      throw new Error('Failed to get AI response');
    }
  }
}

module.exports = { AIService };
