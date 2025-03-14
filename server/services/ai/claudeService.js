// server/services/ai/claudeService.js
const { default: Anthropic } = require('@anthropic-ai/sdk');
const AIService = require('./base/AIService');

class ClaudeService extends AIService {
  constructor(config = {}) {
    super();
    const apiKey = config.apiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("API key for Anthropic is required.");
    }
    this.anthropic = new Anthropic({ apiKey });
    this.defaultModel = config.model || 'claude-3-5-sonnet-latest';
    this.maxRetries = config.maxRetries || 10;
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
  }

  async sendMessage(messages, options = {}) {
    const maxRetries = options.maxRetries || this.maxRetries;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const formattedMessages = messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        }));
        
        let systemPrompt = options.systemPrompt || options.system || "You are a helpful assistant.";
        if (options.conciseMode !== false) {
          if (!systemPrompt.includes("CONCISE communication style")) {
            systemPrompt += `\n\nUse a CONCISE communication style:
- Keep paragraphs short (2-3 sentences maximum)
- Use bullet points for lists
- Be direct and focused
- Eliminate filler words and redundant phrases
- Get to the point quickly
- Avoid unnecessary explanations`;
          }
        }
        
        const response = await this.anthropic.messages.create({
          model: options.model || this.defaultModel,
          system: systemPrompt,
          messages: formattedMessages,
          max_tokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || this.temperature
        });
        return response.content[0].text;
      } catch (error) {
        console.error("Error in AI service:", error.response ? error.response.data : error.message);
        if (++attempt === maxRetries) throw error;
      }
    }
  }
}

module.exports = ClaudeService;