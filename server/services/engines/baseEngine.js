// server/services/engines/baseEngine.js
const AIFactory = require('../ai/aiFactory');
const aiConfig = require('../../config/aiConfig');

class BaseEngine {
  constructor(engineConfig = {}) {
    this.provider = engineConfig.provider || aiConfig.config.defaultProvider || 'claude';
    console.log('⭐ Creating AI service for engine with provider:', this.provider);
    
    try {
      const providerConfig = aiConfig.config[this.provider] || {};
      console.log('⭐ Config available:', !!providerConfig, providerConfig);
      
      this.aiService = AIFactory.createService(this.provider, providerConfig);
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
}

module.exports = BaseEngine;
