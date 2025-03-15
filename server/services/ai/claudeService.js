const { default: Anthropic } = require('@anthropic-ai/sdk');
const AIService = require('./base/AIService');
const logger = require('../../utils/logger');
const { CLAUDE_MODEL } = require('../../config/aiConfig');

class ClaudeService extends AIService {
  constructor(config = {}) {
    super();
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("API key for Anthropic is required.");
    }
    this.anthropic = new Anthropic({ apiKey });
    this.defaultModel = config.model || CLAUDE_MODEL;
    this.maxRetries = config.maxRetries || 3;
    this.maxTokens = config.maxTokens || 4096;
    this.temperature = config.temperature || 0.7;
  }

  async sendMessage(messages, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const response = await this.anthropic.messages.create({
          model: this.defaultModel,
          max_tokens: options.maxTokens || this.maxTokens,
          messages: messages,
          system: options.systemPrompt || "You are an expert system design coach helping developers improve their architecture and implementation decisions.",
          temperature: options.temperature || this.temperature,
        });

        return response.content[0].text;
      } catch (error) {
        attempt++;
        logger.error(`AI Service Error (attempt ${attempt}/${maxRetries}):`, error);
        if (attempt === maxRetries) {
          throw new Error('Failed to get AI response after multiple attempts');
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
}

module.exports = ClaudeService;