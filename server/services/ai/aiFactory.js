const AIService = require('./aiService');
const { config } = require('../../config/aiConfig');

class AIFactory {
  static createService() {
    return new AIService(config);
  }
}

module.exports = AIFactory;
