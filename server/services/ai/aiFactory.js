const AIService = require('./aiService');
const aiConfig = require('../../config/aiConfig');

class AIFactory {
  static create(provider) {  // Changed from createService to create
    if (provider !== 'claude') {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
    return new AIService(aiConfig.config);
  }
}

module.exports = AIFactory;
