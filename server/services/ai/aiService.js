const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const logger = require('../../utils/logger');
const { activeProvider, config } = require('../../config/aiConfig');

class AIService {
  constructor(config) {
    this.provider = config.name;
    this.config = config;
    this.client = this._initializeClient();
  }

  _initializeClient() {
    switch (this.provider) {
      case 'claude':
        return new Anthropic({
          apiKey: this.config.apiKey
        });
      case 'openai':
        return new OpenAI({
          apiKey: this.config.apiKey
        });
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async sendMessage(messages, options = {}) {
    try {
      const systemPrompt = options.systemPrompt || this.config.defaultSystemPrompt;
      
      switch (this.provider) {
        case 'claude':
          return this._sendClaudeMessage(messages, systemPrompt, options);
        case 'openai':
          return this._sendOpenAIMessage(messages, systemPrompt, options);
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async _sendClaudeMessage(messages, systemPrompt, options) {
    const response = await this.client.messages.create({
      model: this.config.model,
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      system: systemPrompt,
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    });
    return response.content[0].text;
  }

  async _sendOpenAIMessage(messages, systemPrompt, options) {
    const response = await this.client.chat.completions.create({
      model: this.config.model,
      max_tokens: options.maxTokens || this.config.maxTokens,
      temperature: options.temperature || this.config.temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ]
    });
    return response.choices[0].message.content;
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

  async reviewCode(code, context = {}) {
    const messages = [{
      role: 'user',
      content: `Review this code:\n${code}\nContext: ${JSON.stringify(context)}`
    }];

    return this.sendMessage(messages, {
      systemPrompt: "You are an expert code reviewer. Analyze the code and provide specific, actionable feedback focusing on best practices, potential issues, and improvements.",
      temperature: 0.3
    });
  }

  async generateTestCases(implementation, requirements) {
    const messages = [{
      role: 'user',
      content: `Generate test cases for:\nImplementation: ${implementation}\nRequirements: ${requirements}`
    }];

    return this.sendMessage(messages, {
      systemPrompt: "You are an expert test engineer. Generate comprehensive test cases that cover edge cases and main functionality.",
      temperature: 0.2
    });
  }
}

module.exports = AIService;