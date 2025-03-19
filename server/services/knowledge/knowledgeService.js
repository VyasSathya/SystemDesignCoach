const AIFactory = require('../ai/aiFactory');
const logger = require('../../utils/logger');

class KnowledgeService {
  constructor(config = {}) {
    this.config = {
      provider: 'claude',
      ...config
    };

    // Use createService instead of create
    this.aiService = AIFactory.createService(this.config.provider, this.config);
    
    // Initialize knowledge base cache
    this.knowledgeCache = new Map();
  }

  async queryKnowledge(topic, source = '') {
    try {
      const cacheKey = `${topic}-${source}`;
      
      // Check cache first
      if (this.knowledgeCache.has(cacheKey)) {
        return this.knowledgeCache.get(cacheKey);
      }

      const prompt = `Provide concise, technical information about: ${topic}`;
      if (source) {
        prompt += ` focusing on ${source}`;
      }

      const response = await this.aiService.sendMessage([
        { role: 'user', content: prompt }
      ], {
        temperature: 0.3,
        maxTokens: 500
      });

      // Cache the response
      this.knowledgeCache.set(cacheKey, response);
      
      return response;
    } catch (error) {
      logger.error('Knowledge query error:', error);
      return `Unable to retrieve knowledge about ${topic} at this time.`;
    }
  }

  clearCache() {
    this.knowledgeCache.clear();
  }
}

module.exports = new KnowledgeService();
