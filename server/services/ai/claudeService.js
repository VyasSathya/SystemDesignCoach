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
    console.log('Using API Key: Key provided');
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
        
        // Apply concise mode to system prompt if not explicitly disabled
        let systemPrompt = options.systemPrompt || options.system || "You are a helpful assistant.";
        if (options.conciseMode !== false) {
          // Only add concise instructions if they're not already in the prompt
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
          temperature: options.temperature || this.temperature,
        });
        return response.content[0].text;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error.response ? error.response.data : error.message);
        console.error("Full error details:", error);
        attempt++;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          return options.fallbackMessage || "I'm having trouble connecting to my knowledge base. Let's try again in a moment.";
        }
      }
    }
  }

  async generateContent(prompt, options = {}) {
    try {
      const messages = [{ role: "user", content: prompt }];
      
      // Apply concise mode to system prompt if not explicitly disabled
      let systemPrompt = options.systemPrompt || options.system || "You are a helpful assistant.";
      if (options.conciseMode !== false) {
        // Only add concise instructions if they're not already in the prompt
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
        messages,
        max_tokens: options.maxTokens || 1500,
        temperature: options.temperature || 0.5,
      });
      return response.content[0].text;
    } catch (error) {
      console.error("Error in generateContent:", error.response ? error.response.data : error.message);
      console.error("Full error details:", error);
      return options.fallbackMessage || "I encountered an issue generating that content. Please try again later.";
    }
  }
}

module.exports = ClaudeService;