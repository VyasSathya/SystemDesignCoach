// server/services/engines/baseEngine.js
const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');

class BaseEngine {
  constructor(engineConfig = {}) {
    this.provider = engineConfig.provider || aiConfig.defaultProvider;
    console.log('⭐ Creating AI service for engine with provider:', this.provider);
    console.log('⭐ Config available:', !!aiConfig[this.provider], aiConfig[this.provider]);
    try {
      this.aiService = AIFactory.createService(this.provider, aiConfig[this.provider]);
      console.log('⭐ AI Service created:', !!this.aiService);
    } catch (error) {
      console.error('ERROR creating AI service:', error);
      throw new Error(`Failed to create AI service: ${error.message}`);
    }
    this.config = engineConfig;
  }
  
  async processMessage(sessionId, message, options = {}) {
    throw new Error('processMessage must be implemented by subclasses');
  }
  
  async startSession(userId, contentId, options = {}) {
    throw new Error('startSession must be implemented by subclasses');
  }
  
  async generateContent(sessionId, contentType, options = {}) {
    throw new Error('generateContent must be implemented by subclasses');
  }
}

module.exports = BaseEngine;
