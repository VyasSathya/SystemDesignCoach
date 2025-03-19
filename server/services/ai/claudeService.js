const { Anthropic } = require('@anthropic-ai/sdk');
const logger = require('../../utils/logger');

class ClaudeService {
  constructor(config = {}) {
    this.config = config;
    
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey && process.env.NODE_ENV !== 'development') {
      logger.error('Missing API key for Claude service');
      throw new Error('API key is required for AI service. Set ANTHROPIC_API_KEY in environment variables or provide in config.');
    }

    // Use mock client for development if no API key
    if (process.env.NODE_ENV === 'development' && !apiKey) {
      this.client = this._createMockClient();
      logger.info('Using mock Claude client for development');
    } else {
      this.client = new Anthropic({
        apiKey: apiKey,
      });
    }
  }

  _createMockClient() {
    return {
      messages: {
        create: async ({ messages, system }) => ({
          content: [{
            text: `[DEV MODE] Mock response to: ${messages[messages.length - 1].content}\nSystem: ${system}`
          }]
        })
      }
    };
  }

  async sendMessage(messages, options = {}) {
    try {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error('Invalid message format');
      }
      
      if (messages.some(m => !m.role || !m.content)) {
        throw new Error('Invalid message format');
      }

      const systemPrompt = options.systemPrompt || this.config.defaultSystemPrompt;

      const response = await this.client.messages.create({
        model: this.config.model || 'claude-3-sonnet-20240229',
        max_tokens: options.maxTokens || this.config.maxTokens || 4096,
        messages: messages,
        system: systemPrompt,
        temperature: options.temperature || this.config.temperature || 0.7,
      });

      return response.content[0].text;
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw error;
    }
  }
}

module.exports = ClaudeService;
