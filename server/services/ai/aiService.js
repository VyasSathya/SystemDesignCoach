const Anthropic = require('@anthropic-ai/sdk');
const logger = require('../../utils/logger');

class AIService {
  constructor(config) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async sendMessage(messages, options = {}) {
    try {
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
      throw new Error('Failed to get AI response');
    }
  }

  async analyzeDiagram(diagramData, context = {}) {
    const messages = [{
      role: 'user',
      content: `Analyze this system design diagram:\n${JSON.stringify(diagramData, null, 2)}\nContext: ${JSON.stringify(context)}`
    }];

    return this.sendMessage(messages, {
      systemPrompt: "You are an expert system design reviewer. Analyze the diagram and provide specific, actionable feedback focusing on architecture, scalability, and best practices.",
      temperature: 0.5
    });
  }
}

module.exports = AIService;
