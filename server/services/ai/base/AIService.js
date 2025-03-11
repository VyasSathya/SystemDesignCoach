// server/services/ai/base/AIService.js
class AIService {
    async sendMessage(messages, options = {}) {
      throw new Error('sendMessage must be implemented by subclasses');
    }
    async generateResponse(messages, context, options = {}) {
      throw new Error('generateResponse must be implemented by subclasses');
    }
    async generateContent(prompt, options = {}) {
      throw new Error('generateContent must be implemented by subclasses');
    }
  }
  
  module.exports = AIService;
  