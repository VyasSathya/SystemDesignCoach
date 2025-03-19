const ClaudeService = require('./claudeService');
const { config } = require('../../config/aiConfig');

class AIFactory {
  static createService(provider, providerConfig) {
    if (provider !== 'claude') {
      throw new Error(`Unsupported AI provider: ${provider}`);
    }
    
    const serviceConfig = {
      ...config,
      ...providerConfig
    };
    
    if (!serviceConfig) {
      throw new Error('AI configuration is missing');
    }
    
    return new ClaudeService(serviceConfig);
  }
}

module.exports = AIFactory;
