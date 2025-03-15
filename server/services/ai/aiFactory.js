const AIService = require('./aiService');
const aiConfig = require('../../config/aiConfig');

class AIFactory {
  static createService() {
    return new AIService(aiConfig.config);
  }
}

module.exports = AIFactory;
