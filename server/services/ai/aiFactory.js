// server/services/ai/aiFactory.js
const ClaudeService = require('./claudeService');

class AIFactory {
  static createService(provider, config = {}) {
    switch (provider.toLowerCase()) {
      case 'claude':
      case 'anthropic':
        return new ClaudeService(config);
      default:
        console.warn(`Unknown AI provider: ${provider}. Defaulting to Claude.`);
        return new ClaudeService(config);
    }
  }
}

module.exports = AIFactory;
